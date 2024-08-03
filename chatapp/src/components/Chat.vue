<script setup>
import { inject, ref, reactive, onMounted } from "vue"
import { useRouter } from "vue-router"
import socketManager from '../socketManager.js'

const router = useRouter()

// #region global state
const userName = inject("userName")
// #endregion

// #region local variable
const socket = socketManager.getInstance()
// #endregion

// #region reactive variable
const chatContent = ref("")
const chatList = reactive([])

// #endregion

// #region lifecycle
onMounted(() => {
  registerSocketEvent()
})
// #endregion

// #region browser event handler
// 投稿メッセージをサーバに送信する
const onPublish = () => {
  // 入力欄を初期化
  socket.emit("publishEvent", {name:userName.value, content:chatContent.value})
  chatContent.value = ""
}

// 退室メッセージをサーバに送信する
const onExit = () => {
  socket.emit("exitEvent", userName.value)
}

// メモを画面上に表示する
const onMemo = () => {
  // メモの内容を表示
  chatList.unshift({role:-1, message:`${userName.value}さんのメモ: ${chatContent.value}`})
  // 入力欄を初期化
  chatContent.value = ""
  console.log(chatList)
}

// #endregion

// #region socket event handler
// サーバから受信した入室メッセージ画面上に表示する
const onReceiveEnter = (data) => {
  chatList.unshift({role:-1, message:`${data}さんが入室しました。`})
}

// サーバから受信した退室メッセージを受け取り画面上に表示する
const onReceiveExit = (data) => {
  chatList.unshift({role:-1, message:data + "さんが退出しました。"})
}

// サーバから受信した投稿メッセージを画面上に表示する
const onReceivePublish = (data) => {
  chatList.unshift({role:data.name, message:`${data.name}さん：${data.content}`})
}

// サーバから受信したゲーム開始メッセージを画面上に表示する
const onReceiveGameStart = (data) => {
  chatList.unshift({role:-1, message:`ゲームを開始しました。テーマは${data}です。`})
}

// 投票結果とウルフ，退出を促すメッセージを画面上に表示する
const onGameFinish = (data) => {
  // サーバから受信した一番投票数が多かった人を受信して画面上に表示する
  chatList.unshift({role:-1, message:data.voted + "がウルフと疑われています。"})
  // 誰がウルフかを画面上に表示する
  chatList.unshift({role:-1, message:data.wolf + "がウルフと疑われています。"})
  //退出を促すメッセージを画面上に表示する
  // 1分後に自動でルームを閉じる
  chatList.unshift({role:-1, message:"1分後に自動でルームを閉じます。"})
  chatList.unshift({role:-1, message:"速やかに退出してください。"})
  setTimeout(() => {
    router.push({ name: "login" })
    socket.emit("roomCloseEvent")
  }, 60000)
}
// #endregion

// #region local methods
// イベント登録をまとめる
const registerSocketEvent = () => {
  // 入室イベントを受け取ったら実行
  socket.on("enterEvent", (data) => {
    onReceiveEnter(data)
  })

  // 退室イベントを受け取ったら実行
  socket.on("exitEvent", (data) => {
    onReceiveExit(data)
  })

  // 投稿イベントを受け取ったら実行
  socket.on("publishEvent", (data) => {
    onReceivePublish(data)
  })

  socket.on("gameStartEvent", (data) => {
    onReceiveGameStart(data)
  })

  // 一番投票数が多かった人を受信する
  socket.on("gameFinishEvent",(data) => {
    onGameFinish(data)
  })

}
// #endregion
</script>

<template>
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">Vue.js Chat チャットルーム</h1>
    <div class="mt-10">
      <p>ログインユーザ：{{ userName }}さん</p>
      <textarea variant="outlined" placeholder="投稿文を入力してください" rows="4" class="area" v-model="chatContent"></textarea>
      <div class="mt-5">
        <button class="button-normal" @click="onPublish">投稿</button>
        <button class="button-normal util-ml-8px" @click="onMemo">メモ</button>
      </div>
      <div class="mt-5" v-if="chatList.length !== 0">
        <ul>
          <li class="item mt-4" v-for="(chat, i) in chatList" :key="i">
            <span v-if="chat.role === -1">
              システム：{{ chat.message }}
            </span>
            <span v-else>
              {{ chat.message }}
            </span>
          </li>
        </ul>
      </div>
    </div>
    <router-link to="/" class="link">
      <button type="button" class="button-normal button-exit" @click="onExit">退室する</button>
    </router-link>
  </div>
</template>

<style scoped>
.link {
  text-decoration: none;
}

.area {
  width: 500px;
  border: 1px solid #000;
  margin-top: 8px;
}

.item {
  display: block;
}

.util-ml-8px {
  margin-left: 8px;
}

.button-exit {
  color: #000;
  margin-top: 8px;
}
</style>