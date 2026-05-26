<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStore } from './stores/user'
import { useHabitStore } from './stores/habit'
import { useRewardStore } from './stores/reward'
import TabBar from './components/common/TabBar.vue'
import AppToast from './components/common/AppToast.vue'

const userStore = useUserStore()
const habitStore = useHabitStore()
const rewardStore = useRewardStore()

onMounted(() => {
  userStore.hydrate()
  habitStore.hydrate()
  rewardStore.hydrate()
})
</script>

<template>
  <div class="app-container">
    <main class="page-content">
      <RouterView />
    </main>
    <TabBar />
    <AppToast />
  </div>
</template>
