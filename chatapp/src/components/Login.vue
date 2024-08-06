<script setup>
import { inject, ref } from "vue"
import { useRouter } from "vue-router"
import socketManager from '../socketManager.js'

//background colorの変更
import { onMounted } from "vue";

onMounted(() => {
  document.documentElement.style.setProperty('--background-color', '#FFC04C');
});

// #region global state
const userName = inject("userName")
// #endregion

// #region local variable
const router = useRouter()
const socket = socketManager.getInstance()
// #endregion

// #region reactive variable
const inputUserName = ref("")
// #endregion

// #region browser event handler
// 入室メッセージをクライアントに送信する
const onEnter = () => {
  // ユーザー名が入力されているかチェック
  if (!inputUserName.value) {
    alert('ユーザー名を入力してください。');
    return;
  }
  // 入室メッセージを送信
  // const inMessage = inputUserName.value + "さんが入室しました。";
  socket.emit("enterEvent", inputUserName.value);
  // 全体で使用するnameに入力されたユーザー名を格納
  userName.value = inputUserName.value;
  // チャット画面へ遷移
  router.push({ name: "chat" })
}
// #endregion
</script>

<template>
  <div class="login">
    <div class="usernname">


      <div class="app-title">
        <img src="../images/tattoo-5389284_1920.png" width="300">
        <h1 class="chokokutai-regular">ワードウルフ</h1>
      </div>

      <div class="login-form">
        <div class="control-group">
          <input type="text" class="login-field" placeholder="username" v-model="inputUserName" />
        </div>
      </div>


      <button type="button" @click="onEnter" class="button">入室する</button>
    </div>
  </div>
</template>



<style scoped>
.login {
  margin: 20px auto;
  width: 400px;
}

.usernname {
  background-color: #FFF;
  padding: 40px;
  border-radius: 5px
}



.app-title {
  text-align: center;
  color: #777;
  margin-bottom: 15px;
}

.login-form {
  text-align: center;
}

.control-group {
  margin-bottom: 15px;
}

input {
  text-align: center;
  background-color: #ECF0F1;
  border: 2px solid transparent;
  border-radius: 3px;
  font-size: 16px;
  font-weight: 200;
  padding: 10px 0;
  width: 250px;
  transition: border .5s;
}

.button {
  border: 2px solid transparent;
  background: #518EE8;
  color: #ffffff;
  font-size: 16px;
  line-height: 25px;
  padding: 10px 0;
  border-radius: 3px;
  display: block;
  width: 250px;
  margin: 0 auto;
}
</style>
