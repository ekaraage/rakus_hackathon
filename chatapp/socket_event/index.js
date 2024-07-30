import { reactive } from "vue"

const allUsers = reactive([])
const theme = "x"
const wolf_theme = "y"
const playerNum = 3


export default (io, socket) => {
  // 入室メッセージをクライアントに送信する
  socket.on("enterEvent", (data) => {
    socket.broadcast.emit("enterEvent", data)
    allUsers.push({
      name: data,
      socket: socket
    })
    console.log(allUsers)
    if (allUsers.length === playerNum) {
      const wolfIndex = Math.floor(Math.random() * playerNum)
      allUsers.forEach((user, index) => {
        const selectedTheme = (index === wolfIndex) ? wolf_theme : theme
        if (socket.id !== user.socket.id) {
          socket.to(user.socket.id).emit("gameStartEvent", selectedTheme);
        } else {
          socket.emit("gameStartEvent", selectedTheme);
        }
      });
    }
  })

  // 退室メッセージをクライアントに送信する
  socket.on("exitEvent", (data) => {
    socket.broadcast.emit("exitEvent", data)
  })

  // 投稿メッセージを送信する
  socket.on("publishEvent", (data) => {
    io.sockets.emit("publishEvent", data)
  })
}