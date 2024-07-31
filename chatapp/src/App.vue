<script setup>
import { provide, ref, reactive } from "vue"

// #region reactive state
const userName = ref("")
const allUsers = reactive([{name: 1, user: 2, voted:2}])
// #endregion

// #region global variable
provide("userName", userName)
provide("allUsers", allUsers)
// #endregion
</script>

<template>
  <router-view />
</template>

<style scoped>
</style>
