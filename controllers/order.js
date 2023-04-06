const bot = "bot"
const client = "client"

const formatMessage = require("../utility/messformat")
const {
  generateOrderHistory,
  printOrderHistory,
  splitOrderhistoryYearMonth,
  printCurrentOrder,
  getOrderAndQuantity,
  getItemsAvailableWithIndex,
  getItemsPrice,
  getItemsIndex,
  isObjEmpty,
  commandMessages
} = require("../utility/order")

async function getOrder(io, socket, userReply) {
  io.emit("message", formatMessage(userReply, client))
  socket.emit(
    "message",
    formatMessage(
      `What would you like to order? <br> ${getItemsAvailableWithIndex().join(
        "<br>"
      )} <br> <br> Please enter the item number and quantity (e.g. "1,2" for 2 items of type 1)`,
      bot
    )
  )
}

async function placeOrder(io, socket, userReply, session) {
  io.emit("message", formatMessage(userReply, client))
  let itemOrder = getOrderAndQuantity(userReply)
  let item = getItemsIndex()[itemOrder.order]

  // if user responds with an invalid quantity amount e.g 2,0 or 2,-1
  if (parseInt(itemOrder.quantity) <= 0) {
    socket.emit("message", formatMessage(`Invalid quantity`, bot))
  }

  // if user decides not to pass in any quantity value
  else if (itemOrder.quantity === undefined) {
    session.order.items[item.item]
      ? (session.order.items[item.item] += 1)
      : (session.order.items[item.item] = 1)
    session.order.total += getItemsPrice(item.item)
    socket.emit(
      "message",
      formatMessage(
        `Added <b>${1} ${item.item}(s)</b> to your order. Your total is now #${
          session.order.total
        }. What else would you like? <br> <br> Press the item number to order more  or <br> Press <b>1</b> to view available items <br> Press <b>97</b> to view order(s)`,
        bot
      )
    )
  }

  // if user passes both item number and quantity required
  else {
    session.order.items[item.item]
      ? (session.order.items[item.item] += parseInt(itemOrder.quantity))
      : (session.order.items[item.item] = parseInt(itemOrder.quantity))
    session.order.total +=
      getItemsPrice(item.item) * parseInt(itemOrder.quantity)
    socket.emit(
      "message",
      formatMessage(
        `Added <b>${itemOrder.quantity} ${item.item}(s)<b> to your order. Your total is now <b>#${session.order.total}</b>. What else would you like? <br> <br> Press the order number or <br> Press <b>1</b> to view available items <br> Press <b>99</b> to check out order <br> press <b>0</b> to cancel order`,
        bot
      )
    )
  }
}

async function checkOutOrder(io, socket, userReply, session) {
  io.emit("message", formatMessage(userReply, client))
  if (isObjEmpty(session.order.items)) {
    socket.emit(
      "message",
      formatMessage(
        `Your have no order to checkout. <br> <br> Press <b>1</b> to place order`,
        bot
      )
    )
  }
  else {
    const generatedOrderHistory = generateOrderHistory(session.order, session)

    // Emit orderHistory to client to be stored on localStorage
    io.emit("store-data", generatedOrderHistory)
    socket.emit(
      "message",
      formatMessage(
        `Your total is <b>#${session.order.total}</b>. Thank you for your order! <br> <br> Would you like to order more? Press <b>1</b> <br> Press <b>98</b> to print out order history`,
        bot
      )
    )
    session.order = { items: {}, total: 0 }
    // manually save the session to the store
    await session.save()
  }
 
}

async function orderHistory(io, socket, userReply, orderHistory) {
  let splitted = splitOrderhistoryYearMonth(userReply)
  //   socket.on("printOrderHistory", (orderHistory) => {
  if (!orderHistory || isObjEmpty(orderHistory)) {
    io.emit("message", formatMessage(userReply, client))
    socket.emit(
      "message",
      formatMessage(
        `You have no order history <br> <br> Press <b>1</b> to make order`,
        bot
      )
    )
  } else {
    io.emit("message", formatMessage(userReply, client))
    socket.emit(
      "message",
      formatMessage(
        `Your order history is: <br> <br> ${printOrderHistory(
          orderHistory,
          splitted.year,
          splitted.month
        )}`,
        bot
      )
    )
  }
}
//   )
//   socket.disconnect(0)
// }
// }

async function currentOrder(io, socket, userReply, session) {
  if (isObjEmpty(session.order.items)) {
    io.emit("message", formatMessage(userReply, client))
    socket.emit(
      "message",
      formatMessage(
        `You have no current order <br> <br> Press <b>1</b> to make order`,
        bot
      )
    )
  } else {
    io.emit("message", formatMessage(userReply, client))
    socket.emit(
      "message",
      formatMessage(
        `Your current order is: <br> <br> ${printCurrentOrder(
          session.order
        )} <br> <br> Press <b>99</b> to checkout order <br> Press <b>0</b> to cancel order`,
        bot
      )
    )
  }
}

async function cancelOrder(io, socket, userReply, session) {
  io.emit("message", formatMessage(userReply, client))
  if (isObjEmpty(session.order.items)) {
    socket.emit(
        "message",
        formatMessage(
          `You have no order to cancel. <br> <br> Press <b>1</b> to make order`,
          bot
        )
      )
  } else {
    socket.emit(
        "message",
        formatMessage(
          `Your order has been cancelled. <br> <br> Press <b>1</b> to make order`,
          bot
        )
      )
      session.order = { items: {}, total: 0 }
  }

}

async function invalidReply(io, socket, userReply) {
  io.emit("message", formatMessage(userReply, client))
  socket.emit(
    "message",
    formatMessage(
      `Please enter a valid command <br> <br> ${commandMessages.join("<br>")}`,
      bot
    )
  )
}

module.exports = {
  getOrder,
  placeOrder,
  checkOutOrder,
  orderHistory,
  currentOrder,
  cancelOrder,
  invalidReply
}