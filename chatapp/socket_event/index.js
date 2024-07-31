import { inject } from "vue"

const allUsers = inject("allUsers")
const theme = "x"
const wolf_theme = "y"
const playerNum = 3
const wolfIndex = Math.floor(Math.random() * playerNum)

export default (io, socket) => {
  // 入室メッセージをクライアントに送信する
  socket.on("enterEvent", (data) => {
    socket.broadcast.emit("enterEvent", data)
    allUsers.push({
      name: data,
      socket: socket,
      voted: 0
    })
    console.log(allUsers)
    if (allUsers.length === playerNum) {
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

  // 投票結果
  socket.on("vote", (data) => {
    console.log(data)
    allUsers[allUsers.findIndex(u => u.name === data)].voted++
    // 全員投票終わったら
    if(allUsers.reduce(function(sum, u){return sum + u.voted;}, 0) === playerNum){
      var votedpls = []
      var votedpl_score = 0
      allUsers.forEach(u => {
        if(u.voted > votedpl_score){votedpls = [u.name]}
        else if(u.voted === votedpl_score){votedpls.push(u.name)}
      })
      const votedpls_str = votedpls.join(" さんと ") + " さん"
      io.sockets.emit("gameFinishEvent",{voted:votedpls_str, wolf:allUsers[wolfIndex].name})
    }
  })
}