<script setup>
import { computed } from 'vue'
import { useUiStore } from '../../stores/ui'

const uiStore = useUiStore()
const toast = computed(() => uiStore.toast)
</script>

<template>
  <transition name="toast-fade">
    <div v-if="toast.visible" class="toast-wrap">
      <div class="toast" :class="toast.type">{{ toast.message }}</div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.toast-wrap {
  position: fixed;
  top: 18px;
  left: 50%;
  z-index: 60;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 360px;
}

.toast {
  padding: 12px 14px;
  border-radius: 18px;
  color: $text-white;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  box-shadow: $shadow-md;

  &.success {
    background: rgba(24, 138, 105, 0.92);
  }

  &.error {
    background: rgba(194, 72, 61, 0.94);
  }

  &.info {
    background: rgba(76, 80, 140, 0.94);
  }

  &.warning {
    background: rgba(204, 122, 0, 0.94);
  }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 180ms ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
