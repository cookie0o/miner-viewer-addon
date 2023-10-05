// get stored values
const XMR_address = localStorage.getItem("moneroXMR_address"); // xmr address

// XMR values
if (localStorage.getItem("moneroStorage") !== null) {
  var moneroStorage = JSON.parse(localStorage.getItem("moneroStorage"));
} else {
  var moneroStorage = {balance: [], last_reward: [], submittedHashes: []};
  localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));}

// import functions for later use
import {
  trimString_x, // (string, length)
} from '../shared/js/functions.js';

function unformatHashrate(hashrateStr) {
  try {
    const unitMultipliers = { KH: 1e3, MH: 1e6, GH: 1e9, TH: 1e12, PH: 1e15 };
    const [value, unit] = hashrateStr.split(' ');
    if (unit in unitMultipliers) {
      const hashrate = parseFloat(value) * unitMultipliers[unit];
      const formattedHashrate = hashrate.toFixed(0);
      return formattedHashrate;
    } else {
      return 'Invalid unit';
    }
  } catch {
    return "0"
  } 
}

function nanopool_org_saving(walletDetails) {
  var balance = walletDetails.data.balance;
  if (isNaN(balance)) {balance = 0} else {
    balance = (walletDetails.data.balance);
  }

  var last_reward = 0
  if (isNaN(last_reward)) {last_reward = 0}

  var hashrate = walletDetails.data.hashrate;
  if (hashrate == undefined) {hashrate = 0} else {
    hashrate = unformatHashrate((hashrate * 1000000000000));
  }

  var total_hashes = 0
  if (isNaN(total_hashes)) {total_hashes = 0}

  localStorage.setItem("nanopool_org.balance", balance);
  localStorage.setItem("nanopool_org.last_reward", last_reward);
  localStorage.setItem("nanopool_org.hashrate", hashrate);
  localStorage.setItem("nanopool_org.total_hashes", total_hashes);
}

// if false dont send requests
var requ_nanopool_org = true

async function init_nanopool_org() {
  if (requ_nanopool_org == false) {return 0}
  try {
    var accExist = await $.get(`https://api.nanopool.org/v1/xmr/accountexist/${XMR_address}`);
  } catch(e) {console.log("error [nanopool.org]\n"+e.message);requ_nanopool_org=false}
  if (accExist.status != false) {
    try {
      var walletDetails = await $.get(`https://api.nanopool.org/v1/xmr/user/${XMR_address}`);
      var minerDetails = await $.get(`https://api.nanopool.org/v1/xmr/workers/${XMR_address}`);
    } catch(e) {console.log("error [nanopool.org]\n"+e.message)}
  } else {
    console.log("no account found: you have to mine 1 share to be visible! [nanopool.org]\n(reload site or change address in settings to try again!)");
    requ_nanopool_org=false
    return 0
  }
  nanopool_org_saving(walletDetails)
  renderRigs(minerDetails);
}
// export function to run miner render
export {init_nanopool_org}


function renderRigs(minerDetails) {
  //$(".rigs .rigscontainer").html(""); // must change!

  // loop through every miner
  for (let i = 0; i < minerDetails.data.length; i++) {

    // sort list
    minerDetails.data.sort((a, b) => b.hashrate - a.hashrate)

    // definitions
    var workerId       = minerDetails.data[i].id
    var Hashrate       = minerDetails.data[i].hashrate

    // check if miner is active
    let active = (Hashrate === undefined) ? false : true;
    let activeClass = (active) ? "active" : "";
    let HashrateFull = (active) ? Hashrate : "0 H";

    // Display values
    var workerIdFull

    workerIdFull = trimString_x(workerId, 8);

    $(".rigscontainer").append(`
    <div class="rig ${activeClass}">
      <p class="name">${workerIdFull}</p>
      <div class="data">
        <p class="big">${HashrateFull}/s</p>
      </div>
    </div>
    `);
  }
}
