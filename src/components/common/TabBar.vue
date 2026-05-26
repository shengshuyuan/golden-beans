<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

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
  <nav class="tab-bar" role="navigation" aria-label="主导航">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-item"
      :class="{ active: activePath === tab.path }"
      :aria-label="tab.label"
      :aria-current="activePath === tab.path ? 'page' : undefined"
    >
      <span class="tab-icon">
        <AppIcon :name="tab.icon" :size="22" />
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

.tab-label {
  font-size: 12px;
  font-weight: 800;
}
</style>
