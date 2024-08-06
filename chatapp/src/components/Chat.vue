<script setup>
import { inject, ref, reactive, onMounted } from "vue"
import { useRouter } from "vue-router"
import socketManager from '../socketManager.js'

const router = useRouter()

// #region global state
const userName = inject("userName")
let allUsers = []
// #endregion

// #region local variable
const socket = socketManager.getInstance()
// #endregion

// #region reactive variable
const chatContent = ref("")
const memoContent = ref("")
const chatList = reactive([])
const selected = ref("")
const popupVisible = ref(false)
const showTestButton = ref(false)  // デバッグ用ボタンの表示制御

// #region norm variable
let highlightRole = ""
// #endregion

// #region lifecycle
onMounted(() => {
  document.documentElement.style.setProperty('--background-color', '#FFC04C');// 背景色を指定可能
  registerSocketEvent()
})
// #endregion

// #region browser event handler
// 投稿メッセージをサーバに送信する
const onPublish = () => {
  // 入力欄を初期化
  socket.emit("publishEvent", { name: userName.value, content: chatContent.value })
  chatContent.value = ""

}

// 退室メッセージをサーバに送信する
const onExit = () => {
  socket.emit("exitEvent", userName.value)
}

// メモを画面上に表示する
const onMemo = () => {
  // メモの内容を表示
  chatList.unshift({ role: -1, message: `${userName.value}さんのメモ: ${chatContent.value}` })
  // 入力欄を初期化
  chatContent.value = ""
}

// 強調表示のユーザーを変更
const setHighlightRole = (role) => {
  if(role !== -1){
    highlightRole = role
  }
  // 再描画にはchatListの長さ操作が必要
  chatList.push({role:-1, message:"再描画中"})
  chatList.pop()
}

const onVote = () => {
  if (!selected.value) {
    alert("ウルフが選択されていません。");
    return;
  }
  socket.emit("vote", selected.value)
  console.log(selected.value)
  closePopup()
}

const showPopup = () => {
  popupVisible.value = true
}

const closePopup = () => {
  popupVisible.value = false
}

// #endregion

// #region socket event handler
// サーバから受信した入室メッセージ画面上に表示する
const onReceiveEnter = (data) => {
  chatList.unshift({ role: -1, message: `${data}さんが入室しました。` })
}

// サーバから受信した退室メッセージを受け取り画面上に表示する
const onReceiveExit = (data) => {
  chatList.unshift({ role: -1, message: data + "さんが退出しました。" })
}

// サーバから受信した投稿メッセージを画面上に表示する
const onReceivePublish = (data) => {
  chatList.unshift({role:data.name, message:data.content})
}

const onUpdateAllUsers = (data) => {
  allUsers = reactive(data)
}

// サーバから受信したゲーム開始メッセージを画面上に表示する
const onReceiveGameStart = (data) => {
  chatList.unshift({ role: -1, message: `ゲームを開始しました。テーマは${data}です。` })
}

// 投票結果とウルフ，退出を促すメッセージを画面上に表示する
const onGameFinish = (data) => {
  // サーバから受信した一番投票数が多かった人を受信して画面上に表示する
  chatList.unshift({ role: -1, message: data.voted + "がウルフと疑われています。" })
  // 誰がウルフかを画面上に表示する
  chatList.unshift({ role: -1, message: data.wolf + "がウルフと疑われています。" })
  //退出を促すメッセージを画面上に表示する
  // 1分後に自動でルームを閉じる
  chatList.unshift({ role: -1, message: "1分後に自動でルームを閉じます。" })
  chatList.unshift({ role: -1, message: "速やかに退出してください。" })
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
  socket.on("gameFinishEvent", (data) => {
    onGameFinish(data)
  })

  socket.on("updateAllUsers", (data) => {
    onUpdateAllUsers(data)
  })
}
// #endregion
</script>
<template>
  <h1 class="header">
    チャットルーム
  </h1>
  <div class="mt-10">
    <p>ログインユーザ：{{ userName }}さん</p>
    <div class="container">

      <!--左側の要素-->
      <div class="chat_box">
        <div class="chat_area mt-5">
          <ul>
            <li class="item mt-4" v-for="(chat, i) in chatList" :key="i">{{ chat.message }}</li>
          </ul>
          <p v-if="chatList.length === 0">まだメッセージがありません。</p>
        </div>

        <div class="input_area mt-5">
          <textarea variant="outlined" placeholder="投稿文を入力してください" rows="4" class="area" v-model="chatContent"></textarea>
        </div>
        <div class="button-container mt-5">
          <button class="button-normal" @click="onPublish">投稿</button>
        </div>
      </div>
      <div class="mt-5" v-if="chatList.length !== 0">
        <ul>
          <li class="item mt-4" v-for="(chat, i) in chatList" :key="i">
            <span class="rolehighlight" v-if="chat.role === highlightRole"><a>{{ chat.role }} さん</a>: {{ chat.message }}</span>
            <span v-else><a class="role" @click="setHighlightRole(chat.role)">{{ chat.role }} さん</a>: {{ chat.message }}</span>
          </li>
        </ul>

      <!--右側の要素-->
      <div class="memo_box">
        <div>time</div>
        <div class="memo_area mt-5">
          <textarea variant="outlined" placeholder="メモ内容" rows="15" class="memo_area" v-model="memoContent"></textarea>
        </div>
      </div>
    </div>
  </div>

  <router-link to="/" class="link">
    <div class="exit-button-container">
      <button type="button" class="button-normal button-exit" @click="onExit">退室する</button>
    </div>
  </router-link>


  <!-- テストボタンの表示制御 -->
  <button v-if="showTestButton" class="button-normal" @click="showPopup">テスト</button>

  <div id="vote" v-if="popupVisible">
    <v-radio-group v-model="selected" background-color="black">
      <v-radio v-for="(name, index) in allUsers" :key="index" :label="name" :value="name" color="primary"></v-radio>
    </v-radio-group>
    <p>怪しい人:<b>{{ selected }}</b></p>
    <button class="button-normal" @click="onVote">投票</button>
  </div>
</template>


<style scoped>
.header {
  color: #333333;
  border-bottom: 2px solid;
  display: inline-block;
  width: 100%;
  text-align: left;
  padding-bottom: 8px;
}

.container {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.chat_box {
  width: 70%;
  background-color: #f1f1f1;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.memo_box {
  width: 40%;
  background-color: #f1f1f1;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chat_area {
  height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #ccc;
  background-color: white;
}

.memo_area {
  width: 100%;
  height: 90%;
  padding: 8px;
  border: 1px solid #ccc;
  background-color: white;
}

.link {
  text-decoration: none;
}

.area {
  width: 100%;
  border: 1px solid #000;
  margin-top: 8px;
}

.util-ml-8px {
  margin-left: 8px;
}

.button-container {
  text-align: right;
}

.button-exit {
  color: #000;
  margin-top: 8px;
}

.role{
  cursor: pointer;
  padding: 1px;
  border-bottom: solid 1px #0005;
}

.rolehighlight{
  color: darkorange;

.exit-button-container {
  text-align: right;
  margin-top: 8px;
}
</style>