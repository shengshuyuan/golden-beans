<script setup>
defineProps({
  maxWidth: {
    type: String,
    default: '340px'
  },
  contentClass: {
    type: String,
    default: ''
  }
})

defineEmits(['close'])
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal" :class="contentClass" :style="{ maxWidth }">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(44, 29, 12, 0.36);
  backdrop-filter: blur(4px);
}

.modal {
  width: 100%;
  padding: 20px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: $shadow-md;
}
</style>
