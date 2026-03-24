<script setup>
import { computed } from 'vue'
import { useUiStore } from '../../stores/ui'

const uiStore = useUiStore()

const toastClass = computed(() => ({
  show: uiStore.toast.visible,
  error: uiStore.toast.type === 'error',
  success: uiStore.toast.type === 'success'
}))
</script>

<template>
  <Teleport to="body">
    <transition name="toast-fade">
      <div v-if="uiStore.toast.visible" class="toast-wrap">
        <div class="toast-card" :class="toastClass">
          {{ uiStore.toast.message }}
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.toast-wrap {
  position: fixed;
  left: 50%;
  bottom: calc(104px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: min(calc(100% - 32px), 360px);
  z-index: 1200;
  pointer-events: none;
}

.toast-card {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(34, 21, 13, 0.92);
  color: $text-white;
  font-size: 14px;
  line-height: 1.45;
  text-align: center;
  box-shadow: 0 18px 40px rgba(34, 21, 13, 0.24);
  backdrop-filter: blur(16px);

  &.error {
    background: rgba(190, 54, 41, 0.94);
  }

  &.success {
    background: rgba(24, 145, 117, 0.94);
  }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
