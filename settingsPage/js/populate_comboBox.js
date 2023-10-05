// populate the ComboBox on page load
import {
  currencyCodes
} from '../../shared/js/lists.js';

const currencySelect = document.getElementById("currencySelect");
function populateComboBox() {
  for (const code of currencyCodes) {
    const option = document.createElement("option");
    option.text = code;
    option.value = code;
    currencySelect.appendChild(option);
  }
  // if no currency is set refer to default: EUR
  var storedCurrency = localStorage.getItem("currency")
  if (storedCurrency == null) {
    localStorage.setItem("currency", "Euro (EUR)");
  } else {
    // set saved currency
    currencySelect.value = storedCurrency;
  }
  localStorage.setItem("moneroPrice", "refreshing");
}
// run function
populateComboBox();