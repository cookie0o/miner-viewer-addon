// Check if address is set
function check() {
  const StorageXMR_address = localStorage.getItem("moneroXMR_address");
  if (StorageXMR_address == null || StorageXMR_address == "" || StorageXMR_address == " ") {
    window.open("./settingsPage/settingsPage.html", "_self");
    console.log("XMR XMR_address check failed: " + JSON.stringify(StorageXMR_address));

    // get currency and set it since it should not be deleted
    const currency = localStorage.getItem("currency")
    // clear local storage
    localStorage.clear();
    // set currency again
    localStorage.setItem("currency", currency)
  }
}
check()