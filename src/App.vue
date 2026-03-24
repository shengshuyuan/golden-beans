<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'
import { useHabitStore } from './stores/habit'
import { useRewardStore } from './stores/reward'
import TabBar from './components/common/TabBar.vue'
import AppToast from './components/common/AppToast.vue'

const userStore = useUserStore()
const habitStore = useHabitStore()
const rewardStore = useRewardStore()

onMounted(() => {
  userStore.init()
  habitStore.init()
  rewardStore.init()
})
</script>

<template>
  <div class="app-container">
    <div class="device-frame">
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <TabBar />
      <AppToast />
    </div>
  </div>
</template>

<style lang="scss">
@use './assets/styles/variables' as *;

.device-frame {
  min-height: 100vh;
  position: relative;
}

@media (min-width: 769px) {
  .device-frame {
    margin: 20px auto;
    min-height: calc(100vh - 40px);
    border-radius: 40px;
    overflow: hidden;
    box-shadow: 0 32px 90px rgba(127, 85, 27, 0.22);
    border: 10px solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(18px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
