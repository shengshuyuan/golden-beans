<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { path: '/', label: '今日', icon: 'home' },
  { path: '/habits', label: '习惯', icon: 'target' },
  { path: '/rewards', label: '奖励', icon: 'gift' },
  { path: '/gold-ledger', label: '金豆', icon: 'coin' },
  { path: '/stats', label: '统计', icon: 'chart' }
]

const activePath = computed(() => {
  const current = tabs.find(tab => route.path === tab.path || route.path.startsWith(`${tab.path}/`))
  return current?.path || '/'
})
</script>

<template>
  <nav class="tab-bar">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-item"
      :class="{ active: activePath === tab.path }"
    >
      <span class="tab-icon">
        <!-- 今日 -->
        <svg v-if="tab.icon === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <!-- 习惯 -->
        <svg v-else-if="tab.icon === 'target'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
        <!-- 奖励 -->
        <svg v-else-if="tab.icon === 'gift'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 12 20 22 4 22 4 12"/>
          <rect x="2" y="7" width="20" height="5"/>
          <line x1="12" y1="22" x2="12" y2="7"/>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
        <!-- 金豆 -->
        <svg v-else-if="tab.icon === 'coin'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v12"/>
          <path d="M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5"/>
        </svg>
        <!-- 统计 -->
        <svg v-else-if="tab.icon === 'chart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      </span>
      <span class="tab-label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.tab-bar {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: min(calc(100% - 20px), 452px);
  padding: 12px 10px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 36px rgba(158, 112, 57, 0.18);
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  z-index: 40;
  @include safe-area-bottom(12px);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-height: 62px;
  padding: 8px 6px;
  border-radius: 20px;
  color: #8d8392;
}

.tab-item.active {
  background: linear-gradient(180deg, rgba(255, 244, 222, 0.98), rgba(255, 238, 204, 0.92));
  color: $primary-deep;
}

.tab-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon svg {
  width: 100%;
  height: 100%;
}

.tab-label {
  font-size: 12px;
  font-weight: 800;
}
</style>
