const display_currency = localStorage.getItem("currency"); // currency defined by the user
// imports
import {
  currencyCodes,
  currencyCodeMap,
  currencySymbols
} from './lists.js';

// get selected currency and translate it to a valid currency Code
function SelectedCurrency(currency) {
  const lowercaseName = currency.toLowerCase();
  return currencyCodeMap[lowercaseName] || null;
}
  
// get the currency symbol of the provided currency
function getCurrencySymbol(currencyCode) {
  const code = currencyCode.toLowerCase();
  return currencySymbols[code] || null;
}

// format hash rate for a better readability
function formatHashrate(hashrate) {
  if (hashrate >= 1000000) {
    return (hashrate / 1000000).toFixed(2) + ' MH/s';
  } else if (hashrate >= 1000) {
    return (hashrate / 1000).toFixed(2) + ' KH/s';
  } else {
    return hashrate.toFixed(2) + ' H/s';
  }
}

// trim a string after x chars and add "..." to the end
function trimString_x(string, length) {
  if (string.length > length) {
    return string.substring(0, length) + "...";
  } else {
    return string;
  }
}

function format_UNIX_time(Time, mode) {
  if (mode == "ago") {
    // Given date in Unix timestamp format (seconds)
    const LastShareDateMilliseconds = Time * 1000;

    // Get the current date and time
    const currentDate = new Date();

    // Convert the given date to a Date object
    const LastShareDate = new Date(LastShareDateMilliseconds);

    // Calculate the time difference in milliseconds
    const timeDifferenceInMilliseconds = currentDate - LastShareDate;

    // Convert the time difference to days, hours, minutes, seconds and milliseconds
    const daysDifference = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24));
    const hoursDifference = Math.floor((timeDifferenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesDifference = Math.floor((timeDifferenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const secondsDifference = Math.floor((timeDifferenceInMilliseconds % (1000 * 60)) / 1000);
    const millisecondsDifference = timeDifferenceInMilliseconds % 1000;

    let lastShare;

    if (daysDifference > 0) {
        lastShare = daysDifference + " day" + (daysDifference === 1 ? "" : "s") + " ago";
    } else if (hoursDifference > 0) {
        lastShare = hoursDifference + " hour" + (hoursDifference === 1 ? "" : "s") + " ago";
    } else if (minutesDifference > 0) {
        lastShare = minutesDifference + " minute" + (minutesDifference === 1 ? "" : "s") + " ago";
    } else if (secondsDifference > 0) {
        lastShare = secondsDifference + " second" + (secondsDifference === 1 ? "" : "s") + " ago";
    } else {
        lastShare = millisecondsDifference + " millisecond" + (millisecondsDifference === 1 ? "" : "s") + " ago";
    }

    return lastShare.replace("-", "");
  }
  if (mode == "accurate") {
    // Create a Date object by converting the Time to milliseconds
    var date = new Date(Time * 1000);

    // Format the date as a readable string
    var formattedDate =
      `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ` +
      `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;

    return formattedDate
  }
}

// get current xmr return rate
var oldCurrency = undefined
function get_return_rate(currentBalanceXMR) {
  const selectedCurrency = SelectedCurrency(display_currency);
  const apiEndpoint = `https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=${selectedCurrency}`;

  // Function to fetch the current Monero price from the API
  async function fetchMoneroPrice() {
    try {
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      return data.monero[selectedCurrency];
    } catch (error) {
      console.error('Error fetching Monero price:', error);
      return null;
    }
  }

  // Function to get the current timestamp
  function getCurrentTimestamp() {
      return Math.floor(Date.now() / 1000);
  }

  // Function to get the stored price, timestamp from localStorage
  function getStoredPrice() {
      const storedPrice = localStorage.getItem('moneroPrice');
      const storedTimestamp = localStorage.getItem('moneroTimestamp');
      return { price: storedPrice, timestamp: parseInt(storedTimestamp) };
  }

  // Function to set the price and timestamp in localStorage
  function setStoredPrice(price, timestamp) {
      localStorage.setItem('moneroPrice', price);
      localStorage.setItem('moneroTimestamp', timestamp);
  }

  // Function to update the Monero price every 20 seconds
  async function updateMoneroPrice() {
    const storedData = getStoredPrice();
    const currentTime = getCurrentTimestamp();

    // Check if the stored price is less than 20 seconds old
    if (storedData.price && currentTime - storedData.timestamp < 20 || oldCurrency == selectedCurrency) {
      // Use the stored value
      return storedData.price;
    } else {
      // store old price
      oldCurrency = selectedCurrency
      // Fetch the new price from the API
      const newPrice = await fetchMoneroPrice();
      if (newPrice) {
        if (newPrice != storedData.price) {
          console.log('Updated Monero price to:', newPrice);
        }
        setStoredPrice(newPrice, currentTime);
        return newPrice;
      } else {
        // If there's an error fetching the new price, display its value (undefined)
        console.log('Fetching Monero price failed', newPrice);
        return newPrice;
      }
    }
  }
  return new Promise((resolve, reject) => {
    updateMoneroPrice()
      .then((xmrToCurrencyRate) => {
        // Calculate the equivalent value in the selected currency
        const currentBalance = currentBalanceXMR * xmrToCurrencyRate;
  
        // Check if xmrToCurrencyRate is undefined or NaN
        if (typeof xmrToCurrencyRate === 'undefined' || isNaN(xmrToCurrencyRate)) {
          if (xmrToCurrencyRate == 'refreshing') {resolve('refreshing...')}
          resolve('N/A');
        } else {
          resolve(currentBalance.toFixed(2));
        }
      })
      .catch((error) => {
        // Reject the promise with the error
        reject(error);
      });
  });

}  

// remove symbols and just leave the raw hashrate value
function unformatHashrate(hashrateStr) {
  if (hashrateStr == undefined) {return 0}
  const unitMultipliers = { H: 1, KH: 1e3, MH: 1e6, GH: 1e9, TH: 1e12, PH: 1e15 };
  const [value, unit] = hashrateStr.split(' ');
  if (unit in unitMultipliers) {
    const hashrate = parseFloat(value) * unitMultipliers[unit];
    const formattedHashrate = hashrate.toFixed(0);
    return formattedHashrate;
  } else {
    return 'Invalid unit';
  }
}

// remove % and just leave the raw number
function removePercentage(combined) {
  if (combined == undefined) {return 0}
  const [value, percentage] = combined.split(' ');
  return value
}
    
// export functions
export {
  format_UNIX_time,
  SelectedCurrency,
  getCurrencySymbol,
  formatHashrate,
  unformatHashrate,
  trimString_x,
  get_return_rate,
  removePercentage
};