// Save XMR address
if (localStorage.getItem("moneroXMR_address") !== null) {$("textarea#xmraddress").val(localStorage.getItem("moneroXMR_address"))}


function UpdateAddress() {
  localStorage.setItem("moneroXMR_address", $(this).val());
}
document.getElementById('xmraddress').addEventListener('input', UpdateAddress);

// Save Currency Code
if (localStorage.getItem("currency") !== null) {$("#currencySelect").val(localStorage.getItem("currency"));}

$("#currencySelect").on("change", function() {
  localStorage.setItem("currency", $(this).val());
});

// donate btn
document.getElementById('donate_btn').addEventListener('click', function() {
  // open URL
  window.open('https://github.com/cookie0o/cookie0o/blob/main/.github/FUNDING.md', "_blank");
});