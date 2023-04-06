const socket = io()
const chatList = document.querySelector(".chat-list")
const chatForm = document.querySelector("#chat-form")
const sendButton = document.querySelector("button")
const inputField = document.querySelector('input[type="text"]')

socket.on("message", (message) => {
  renderMessage(message)
  chatList.scrollTop = chatList.scrollHeight
})

socket.on("store-data", async (data) => {
  const existing = localStorage.getItem('orderHistory')
  const storageExists = existing ? JSON.parse(existing) : {}
  // await JSON.parse(localStorage.getItem("orderHistory"))

  console.log(storageExists)
  const order = {
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  }
  
  if (storageExists) {
    console.log('storage already exist, DO NOT run')
    if (!storageExists[order.year]) {
      storageExists[order.year] = {}
    }
    if (!storageExists[order.year][order.month]) {
      storageExists[order.year][order.month] = []
    }

    data[order.year][order.month].forEach((item) => {
      storageExists[order.year][order.month].push(item)
    })

    localStorage.setItem("orderHistory", JSON.stringify(storageExists))
  } else {
    console.log('run')
    localStorage.setItem("orderHistory", JSON.stringify(data))
  }
})

function renderMessage(message) {
  const { text, sender, time } = message

  const li = document.createElement("li")
  li.classList.add("chat-message")
  li.classList.add(sender === "client" ? "sent" : "received")
  li.innerHTML = text
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = sender;
  p.innerHTML += ` <span>${time}</span>`;
  li.appendChild(p)
  chatList.appendChild(li)
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const msg = e.target.elements.msg.value.trim()
  if (msg.length > 0) {
    //emitting a message to the server
    socket.emit("reply", msg)
    socket.emit("printOrderHistory", {
      msg: msg,
      orderHistory: JSON.parse(localStorage.getItem("orderHistory"))
    })
    inputField.value = ""
    inputField.focus()
  }
})