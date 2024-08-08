import { reactive } from "vue"


const allUsers = reactive([])
const theme = "メガネ"
const wolf_theme = "サングラス"
const playerNum = 3
const wolfIndex = Math.floor(Math.random() * playerNum)
let timeCounter = null
let isStarted = false
let nowTime = new Date()
const duration = 10 * 1000
let seconds = duration



export default (io, socket) => {
  const updateAllUsers = () => {
    var allUsersName=[]
    allUsers.forEach((user, index) => {
        allUsersName.push(user.name)
     })
    io.sockets.emit("updateAllUsers",allUsersName)
  }
  const removeUser = (socket) => {
    allUsers.splice(allUsers.findIndex(u => u.socket.id === socket.id), 1)
  }
  socket.on("tryenterEvent", (data) => {
    var allUsersName=[]
    allUsers.forEach((user, index) => {
        allUsersName.push(user.name)
     })
    const sendObject = {
      isStarted: isStarted,
      allUsersName: allUsersName
    }
    socket.emit("isStartedAndAllUsers", sendObject)
  })
  // 入室メッセージをクライアントに送信する
  socket.on("enterEvent", (data) => {
    socket.broadcast.emit("enterEvent", data)
    //userStore.addUser(data, socket, 0)
    allUsers.push({
      name: data,
      socket: socket,
      voted: 0
    })
    updateAllUsers()
    if (allUsers.length === playerNum) {
      isStarted = true
      let startTime=new Date()
      allUsers.forEach((user, index) => {
        const selectedTheme = (index === wolfIndex) ? wolf_theme : theme
        if (socket.id !== user.socket.id) {
          socket.to(user.socket.id).emit("gameStartEvent", {selectedTheme: selectedTheme, startTime: startTime, duration: duration });
        } else {
          socket.emit("gameStartEvent", {selectedTheme: selectedTheme, startTime: startTime, duration: duration });
        }
      });
      timeCounter = setInterval(() => { 
        nowTime = new Date()
        seconds = (Math.round(duration / 1000) - (Math.round(nowTime / 1000) - Math.round(startTime / 1000)))
        console.log(seconds)
        if (seconds == 0) { 
          io.sockets.emit("timeUp", data)
        }
      }, 1000)

    }


  })

  // 退室メッセージをクライアントに送信する
  socket.on("exitEvent", (data) => {
    removeUser(socket)
    clearInterval(timeCounter)
    timeCounter = null
    seconds = 0
    nowTime = new Date()
    isStarted = false
    socket.broadcast.emit("exitEvent", data)
    socket.broadcast.emit("gameCanceledEvent")
    updateAllUsers()
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
    if (allUsers.reduce(function (sum, u) { return sum + u.voted; }, 0) === playerNum) {
      var votedpls = []
      var votedpl_score = 0
      allUsers.forEach(u => {
        if (u.voted > votedpl_score){
          votedpls = [u.name]
          votedpl_score = u.voted
        }
        else if (u.voted === votedpl_score) { votedpls.push(u.name) }
      })
      const votedpls_str = votedpls.join(" さんと ") + " さん"
      io.sockets.emit("gameFinishEvent", { voted: votedpls_str, wolf: allUsers[wolfIndex].name })
    }
  })
  socket.on("roomCloseEvent", () => {
    allUsers.splice(0, allUsers.length)
    clearInterval(timeCounter)
    timeCounter = null
    seconds = 0
    nowTime = new Date()
    isStarted = false
  })
}

