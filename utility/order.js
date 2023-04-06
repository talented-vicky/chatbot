const moment = require("moment")
const time = moment().format("h:mm a")
const dayNum = moment().day()
const day = moment.weekdays(dayNum)

/**
 * Any change in command messages will require that you edit
 * some messages on the server
 */
const commandMessages = [
  "Press <b>1</b> to place an order",
  "Press <b>99</b> to checkout order",
  "Press <b>98</b> to see order history",
  "Press <b>97</b> to see current history",
  "Press <b>0</b> to cancel order"
]

/**
 * Update this part with your items
 * and their respective prices
 */
const itemsAvailable = [
  { item: "Pizza", price: 10 },
  { item: "Burger", price: 5 },
  { item: "Fries", price: 2 },
  { item: "Soda", price: 1 }
]

/**
 *
 * @param {object} orderObj
 * @param {} session
 * @returns {object}
 */
function generateOrderHistory(orderObj, session) {
  const order = {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    items: orderObj
  }

  session.orderHistory ? session.orderHistory : (session.orderHistory = {})
  console.log(session)
  console.log(session.order)
  console.log(session.orderHistory)

  if (!session.orderHistory[order.year]) {
    session.orderHistory[order.year] = {}
  }
  if (!session.orderHistory[order.year][order.month]) {
    session.orderHistory[order.year][order.month] = []
  }
  session.orderHistory[order.year][order.month].push(order.items)

  return session.orderHistory
}

/**
 *
 * @param {number} monthNumber
 * @returns {date}
 */
function getMonthName(monthNumber) {
  const date = new Date()
  date.setMonth(monthNumber - 1)

  return date.toLocaleString("en-US", { month: "long" })
}

/**
 *
 * @param {object} orderHistory
 * @param {number} year
 * @param {number} month
 * @returns {string}
 */
function printOrderHistory(orderHistory, year = undefined, month = undefined) {
  let message = ""
  if (!year && !month) {
    for (let year in orderHistory) {
      for (let month in orderHistory[year]) {
        message += `Order History for ${getMonthName(month)} ${year} <br> <br>`
        orderHistory[year][month].forEach((order, index) => {
          message += `Order ${index + 1} - <i>${time}, ${day}</i> <br> ${printCurrentOrder(order)} <br>`
        })
      }
    }
  } else if (year && !month) {
    for (let month in orderHistory[year]) {
      message += `Order History for ${getMonthName(month)} ${year} <br> <br>`
      orderHistory[year][month].forEach((order, index) => {
        message += `Order ${index + 1} - <i>${time}, ${day}</i> <br> ${printCurrentOrder(order)} <br>`
      })
    }
  } else if (year && month) {
    message += `Order History for ${getMonthName(month)} ${year} <br> <br>`
    orderHistory[year][month].forEach((order, index) => {
      message += `Order ${index + 1} - <i>${time}, ${day}</i> <br> ${printCurrentOrder(order)} <br>`
    })
  } else if (!year && month) {
    for (let year in orderHistory) {
      if (orderHistory[year][month]) {
        message += `Order History for ${month} ${year} <br>`
        orderHistory[year][month].forEach((order, index) => {
          message += `Order ${index + 1} - <i>${time}, ${day}</i> <br> ${printCurrentOrder(order)} <br>`
        })
      }
    }
  } else {
    message += `Input a valid year or month`
  }
  return message
}

/**
 *
 * @param {string} orderReply
 * @returns {object}
 */
function splitOrderhistoryYearMonth(orderReply) {
  let part = orderReply.split(",")
  return { commandNum: part[0], year: part[1], month: part[2] }
}

/**
 *
 * @param {object} order
 * @returns
 */
function printCurrentOrder(order) {
  let message = ""
  let total = 0
  for (let item in order.items) {
    message += `${order.items[item]} ${item}(s) at #${getItemsPrice(
      item
    )} each ---  #${getItemsPrice(item) * order.items[item]} <br>`
    total += getItemsPrice(item) * order.items[item]
  }
  message += `<b>Total: #${total}</b>`
  return message
}

/**
 *
 * @returns {array}
 */
function getItemsAvailableWithIndex() {
  let items = []
  itemsAvailable.forEach((item, index) => {
    items.push(`${index + 2}: ${item.item} ---> #${item.price}`)
  })
  return items
}

/**
 *
 * @param {string} orderQuantity
 * @returns
 */
function getOrderAndQuantity(orderQuantity) {
  let parts = orderQuantity.split(",")
  return { order: parts[0], quantity: parts[1] }
}

/**
 *
 * @param {array} item
 * @returns
 */
function getItemsPrice(item) {
  let price
  itemsAvailable.forEach((itemAvailable) => {
    if (itemAvailable.item === item) {
      price = itemAvailable.price
    }
  })
  return parseInt(price)
}

/**
 *
 * @returns {object}
 */
function getItemsIndex() {
  indexedItem = {}
  let index = 0
  itemsAvailable.forEach((itemAvailable, i) => {
    if (i < 95) {
      index = i + 2
      indexedItem[index] = itemAvailable
    } else {
      // skip numbers 97, 98, 99 as they are special command numbers
      index = i + 5
      indexedItem[index] = itemAvailable
    }
  })
  return indexedItem
}

/**
 *
 * @param {object} obj
 * @returns {boolean}
 */
function isObjEmpty(obj) {
  return Object.keys(obj).length === 0
}

module.exports = {
  commandMessages,
  generateOrderHistory,
  printOrderHistory,
  splitOrderhistoryYearMonth,
  printCurrentOrder,
  getOrderAndQuantity,
  getItemsAvailableWithIndex,
  getItemsPrice,
  getItemsIndex,
  isObjEmpty
}