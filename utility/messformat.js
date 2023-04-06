const moment = require("moment")
function formatMessage(message, sender) {
  return { text: message, sender: sender, time: moment().format("h:mm a") }
}

module.exports = formatMessage