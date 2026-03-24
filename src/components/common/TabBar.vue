<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { path: '/', name: '首页', icon: 'home' },
  { path: '/habits', name: '习惯', icon: 'habit' },
  { path: '/rewards', name: '奖励', icon: 'reward' },
  { path: '/stats', name: '统计', icon: 'stats' }
]

const currentPath = computed(() => route.path)

function isActive(path) {
  return currentPath.value === path || (path !== '/' && currentPath.value.startsWith(path))
}

function navigateTo(path) {
  router.push(path)
}
</script>

<template>
  <nav class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
      @click="navigateTo(tab.path)"
    >
      <span class="tab-icon">
        <svg v-if="tab.icon === 'home'" viewBox="0 0 24 24" fill="none">
          <path d="M3 12L5 10L12 4L19 10L21 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6 10.5V20H10V15H14V20H18V10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else-if="tab.icon === 'habit'" viewBox="0 0 24 24" fill="none">
          <path d="M12 3C12 3 7.5 6.3 7.5 10.8C7.5 13.7 9.3 15.4 12 15.4C14.7 15.4 16.5 13.7 16.5 10.8C16.5 6.3 12 3 12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M12 15.4V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M9 18.2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else-if="tab.icon === 'reward'" viewBox="0 0 24 24" fill="none">
          <path d="M12 4L4 8.5V18L12 22L20 18V8.5L12 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <path d="M4 8.5L12 13L20 8.5" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <path d="M12 13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none">
          <path d="M5 20V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M11 20V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M17 20V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M22 20V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </span>
      <span class="tab-name">{{ tab.name }}</span>
    </button>
  </nav>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.tab-bar {
  position: fixed;
  left: 50%;
  bottom: calc(14px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 456px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-xs;
  padding: $spacing-sm;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: 30px;
  box-shadow: 0 22px 65px rgba(111, 72, 24, 0.2);
  backdrop-filter: blur(20px);
  z-index: 90;
}

.tab-item {
  @include flex-column;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  border-radius: 22px;
  color: #9f9ab5;
  transition: background $transition-fast, color $transition-fast, transform $transition-fast;

  &:active {
    transform: scale(0.96);
  }

  &.active {
    color: $primary-color;
    background: linear-gradient(180deg, rgba(255, 232, 198, 0.95), rgba(255, 255, 255, 0.88));

    .tab-icon {
      transform: translateY(-1px);
    }
  }
}

.tab-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-fast;

  svg {
    width: 100%;
    height: 100%;
  }
}

.tab-name {
  font-size: $font-xs;
  font-weight: 700;
  letter-spacing: 0.04em;
}
</style>
