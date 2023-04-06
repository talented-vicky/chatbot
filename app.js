const http = require("http")
const path = require("path")
const express = require("express")
const CORS = require("cors")
const socketio = require("socket.io")
const session = require("express-session")
const MongoDBStore = require("connect-mongodb-session")(session)

const app = express()
const server = http.createServer(app)

const io = socketio(server, { cors: { origin: "*" } })

const formatMessage = require("./utils/formatMessage")

require('dotenv').config()
const bot = "bot"

app.use(CORS())
app.use(express.static(path.join(__dirname, "public")))

const {
  commandMessages,
  getOrderAndQuantity,
  getItemsIndex
} = require("./utils/order")

const {
  getOrder,
  placeOrder,
  checkOutOrder,
  orderHistory,
  currentOrder,
  cancelOrder,
  invalidReply
} = require("./controller/order")

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: "sessions"
})

// using session with express app and socket.io server
app.use(session({
    secret: '456ojhfghjk',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 60 * 24 * 7 * 365
    },
    store: store
}))

io.use(function (socket, next) {
  sessionMiddleware(socket.request, socket.request.res || {}, next)
})

// run when a client connects
io.on("connection", async (socket) => {
  console.log(`User ${socket.id} connected`)
  

  /**
   * socket.request.session becomes available for session storage
   * due to the express-session middleware that was used and linked
   * with the socket.io server
   */
  const session = socket.request.session

  // Store order in session
  session.order = { items: {}, total: 0 }

  // Welcome current client and show order
  socket.emit(
    "message",
    formatMessage(
      `Welcome to OrderBot, <br> ${commandMessages.join("<br>")}`,
      bot
    )
  )

  // Listen on server for reply from client
  socket.on("reply", async (msg) => {
    const userReply = msg

    // if user respponse is 1
    if (userReply === "1") {
      getOrder(io, socket, userReply)
    }

    // if user response is the key (item number) of the item
    else if (
      getItemsIndex().hasOwnProperty(getOrderAndQuantity(userReply).order)
    ) {
      placeOrder(io, socket, userReply, session)
    }
    // if user reply is 99, checkout the order
    else if (userReply === "99") {
      checkOutOrder(io, socket, userReply, session)
    }

    else if (userReply === "97") {
      currentOrder(io, socket, userReply, session)
    }
    // cancel order and set session order to null
    else if (userReply === "0") {
      cancelOrder(io, socket, userReply, session)

    // all other values asides 98 and special values above
    } else if (userReply !== "98") {
      invalidReply(io, socket, userReply)
    }
  })

  socket.on("printOrderHistory", async (order) => {
    userReply = order.msg
    // order history modified to check by month or year
    if (userReply.split(",")[0] === "98") {
      orderHistory(io, socket, userReply, order.orderHistory)
    }
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))