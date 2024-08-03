<script setup>
import { provide, ref, reactive } from "vue"


// #region reactive state
const userName = ref("")
// #endregion

// #region global variable
provide("userName", userName)

// #endregion
</script>

<template>
  <router-view />
</template>

<style scoped>
</style>
