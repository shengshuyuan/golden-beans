<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStore } from './stores/user'
import { useHabitStore } from './stores/habit'
import { useRewardStore } from './stores/reward'
import { useAnalyticsStore } from './stores/analytics'
import { appStorage } from './repositories/appStorage'
import TabBar from './components/common/TabBar.vue'
import AppToast from './components/common/AppToast.vue'

const userStore = useUserStore()
const habitStore = useHabitStore()
const rewardStore = useRewardStore()
const analyticsStore = useAnalyticsStore()

let unsubscribe = null

onMounted(() => {
  userStore.hydrate()
  habitStore.hydrate()
  rewardStore.hydrate()
  analyticsStore.hydrate()

  // Multi-tab sync: when another tab saves, reload all stores
  unsubscribe = appStorage.onSync(() => {
    userStore.hydrate()
    habitStore.hydrate()
    rewardStore.hydrate()
    analyticsStore.hydrate()
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
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
