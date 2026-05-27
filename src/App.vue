<script setup>
import { onMounted, onUnmounted, onErrorCaptured } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStore } from './stores/user'
import { useHabitStore } from './stores/habit'
import { useRewardStore } from './stores/reward'
import { useAnalyticsStore } from './stores/analytics'
import { useUiStore } from './stores/ui'
import { appStorage } from './repositories/appStorage'
import TabBar from './components/common/TabBar.vue'
import AppToast from './components/common/AppToast.vue'

const userStore = useUserStore()
const habitStore = useHabitStore()
const rewardStore = useRewardStore()
const analyticsStore = useAnalyticsStore()
const uiStore = useUiStore()

let unsubscribe = null

onMounted(() => {
  userStore.hydrate()
  habitStore.hydrate()
  rewardStore.hydrate()
  analyticsStore.hydrate()

  // Storage health check
  const health = appStorage.checkHealth()
  if (health.critical) {
    uiStore.showToast('存储空间即将用尽，建议导出备份', 'error', 5000)
  } else if (health.warning) {
    uiStore.showToast('存储空间使用较多，建议导出备份', 'warning', 4000)
  }

  // Multi-tab sync
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

onErrorCaptured((err) => {
  console.error('应用错误:', err)
  uiStore.showToast('页面加载出错，请刷新重试', 'error', 5000)
  return false
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
