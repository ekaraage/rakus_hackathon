<script setup>
import { inject } from "vue"
import { useRouter } from "vue"

const router = useRouter();

const message = inject("message")
const onClick = () => {
  message.value = "Hello Vue.js!"
  router.push({ name: "hello" })
}

</script>

<template>
  <router-view></router-view>
</template>