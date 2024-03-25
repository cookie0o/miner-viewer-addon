// import functions for later use
import {
  format_UNIX_time, // (Time, mode)
  trimString_x, // (string, length)
} from '../shared/js/functions.js';


// get stored values
const XMR_address = localStorage.getItem("moneroXMR_address"); // xmr address

var requ_nanopool_org = true
var requ_xmrpool_eu = true

async function payments_xmrpool_eu () {
  if (requ_xmrpool_eu == false) {return 0}
  try {
    var walletDetails = await $.get(`https://web.xmrpool.eu:8119/stats_address?address=${XMR_address}&longpoll=false`);
  } catch(e) {console.log("error [xmrpool.eu]\n"+e.message)}
  if (walletDetails.error != "Wallet address was not found.") {
    renderPayments_xmrpool_eu(walletDetails)

    var paid = walletDetails.stats.paid;
    localStorage.setItem("xmrpool_eu.paid", paid);
  } else {
    console.log("no account found: you have to mine 1 share to be visible! [xmrpool.eu]\n(reload site or change address in settings to try again!)");
    requ_xmrpool_eu = false;
    return 0
  }
}

function total_paid() {
  var total_paid, xmrpool_eu_total_paid
  // xmrpool_eu
  if (localStorage.getItem("xmrpool_eu.paid") == null) {xmrpool_eu_total_paid = 0} else {
    xmrpool_eu_total_paid = localStorage.getItem("xmrpool_eu.paid")
  }

  // ad everything together
  total_paid = ((xmrpool_eu_total_paid) / 1000000000000)

  // set total paid
  $("#total_paid").text(total_paid + " XMR");
}


// run functions every 5 sek. and on page load once
payments_xmrpool_eu()
payments_nanopool_org()
total_paid()
setInterval(() => {
  // render
  payments_xmrpool_eu()
  total_paid()
}, 5000); 



function renderPayments_xmrpool_eu(walletDetails) {
  // loop through every payment
  for (let i = 0; i < walletDetails.payments.length; i++) {

    // definitions
    var payments = walletDetails.payments[i] || [];

    // Display values
    var transaction_hashFUll, transaction_hashFUll_link, transaction_amountFUll, transaction_mixinFull, transaction_dateFull

    // Print payments and dates
    if (i % 2 === 0) {
      // Payment details (every even index)
      const paymentDetails = payments.split(':');

      transaction_hashFUll_link = paymentDetails[0]
      transaction_hashFUll = trimString_x(paymentDetails[0], 6)
      transaction_amountFUll = (paymentDetails[1] / 1000000000000).toFixed(6)
      transaction_mixinFull = paymentDetails[3]
    } else {
      transaction_dateFull = format_UNIX_time(payments, "accurate")

      $(".payments .paymentscontainer").append(`
      <div class="payment-block">
        <div class="header1-container">
          <p class="header1">Pool</p>
          <p class="header1">Mixin</p>
          <p class="header1">Amount</p>
        </div>
        <div class="content">
          <img class="img"src="../shared/res/xmrpool_eu.png">
          <p class="mixin">${transaction_mixinFull}</p>    
          <p class="amount">${transaction_amountFUll}</p>
        </div>
        <div class="header2-container">
          <p class="header2">Hash</p>
          <p class="header2" style="padding-left: 90px;">Date</p>
          </div>
        <div class="content2">
          <a href="https://xmrchain.net/tx/${transaction_hashFUll_link}" target="_blank"><p class="hash">${transaction_hashFUll}</p></a>
          <p class="date">${transaction_dateFull}</p>  
        </div>
      </div>
      `);
    }
  }
}
