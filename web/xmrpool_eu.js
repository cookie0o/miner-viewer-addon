// get stored values
const XMR_address = localStorage.getItem("moneroXMR_address"); // xmr address

// import functions for later use
import {
  unformatHashrate, // (hashrate)
  trimString_x, // (string, length)
} from '../shared/js/functions.js';

function xmrpool_eu_saving(walletDetails) {
  var balance = walletDetails.stats.balance;
  if (balance == undefined || isNaN(balance)) {balance = 0} else {
    balance = (walletDetails.stats.balance / 1000000000000);
  }

  var last_reward = walletDetails.stats.last_reward;
  if (last_reward == undefined || isNaN(last_reward)) {last_reward = 0} else {
    last_reward = (walletDetails.stats.last_reward / 1000000000000);
  }

  var hashrate = walletDetails.stats.hashrate;
  if (hashrate == undefined) {hashrate = 0} else {
    hashrate = unformatHashrate(hashrate);
  }

  var total_hashes = walletDetails.stats.hashes;
  if (total_hashes == undefined || isNaN(total_hashes)) {total_hashes = 0}
  
  localStorage.setItem("xmrpool_eu.balance", balance);
  localStorage.setItem("xmrpool_eu.last_reward", last_reward);
  localStorage.setItem("xmrpool_eu.hashrate", hashrate);
  localStorage.setItem("xmrpool_eu.total_hashes", total_hashes);
}

var requ_xmrpool_eu = true

async function init_xmrpool_eu() {
  if (requ_xmrpool_eu == false) {return 0}
  try {
    var walletDetails = await $.get(`https://web.xmrpool.eu:8119/stats_address?address=${XMR_address}&longpoll=false`);
  } catch(e) {console.log("error [xmrpool.eu]\n"+e.message)}
  if (walletDetails.error != "Wallet address was not found.") {
    xmrpool_eu_saving(walletDetails)
    renderRigs(walletDetails);
  } else {
    console.log("no account found: you have to mine 1 share to be visible! [xmrpool.eu]\n(reload site or change address in settings to try again!)");
    requ_xmrpool_eu = false;
    return 0
  }
}
// export function to run miner render
export {init_xmrpool_eu}


function renderRigs(walletDetails) {
  var numberOfExistingElements = $(".rigscontainer #rig_xmrpool_eu").length;
  var requiredNumberOfElements = walletDetails.perWorkerStats.length;

  // loop through every miner
  for (let i = 0; i < requiredNumberOfElements; i++) {

    // Sort list
    walletDetails.perWorkerStats.sort((a, b) => unformatHashrate(b.hashrate) - unformatHashrate(a.hashrate))

    // Definitions
    var workerId       = walletDetails.perWorkerStats[i].workerId
    var Hashrate       = walletDetails.perWorkerStats[i].hashrate

    // Check if miner is active
    let active = (Hashrate === undefined) ? false : true;
    let activeClass = (active) ? "active" : "";
    let HashrateFull = (active) ? Hashrate : "0 H";

    // Display values
    var workerIdFull

    workerIdFull = trimString_x(workerId, 8);

    // Find existing element and update its content if it exists
    var $existingRig = $(".rigscontainer #rig_xmrpool_eu").eq(i);
    if ($existingRig.length > 0) {
      // Update the content of existing element
      $existingRig.html(`
        <p class="name">${workerIdFull}</p>
        <div class="data">
          <p class="big">${HashrateFull}/s</p>
        </div>
      `);
    } else {
      // Create a new element
      $(".rigscontainer").append(`
        <div class="rig ${activeClass}" id="rig_xmrpool_eu">
          <p class="name">${workerIdFull}</p>
          <div class="data">
            <p class="big">${HashrateFull}/s</p>
          </div>
        </div>
      `);
    }
  }

  // Remove extra elements if there are more existing elements than required
  $(".rigscontainer #rig_xmrpool_eu").slice(requiredNumberOfElements).remove();
}
