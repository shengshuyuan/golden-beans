<script setup>
import { ref, onMounted, onUnmounted, nextTick, useTemplateRef } from 'vue'

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

const emit = defineEmits(['close'])
const modalRef = useTemplateRef('modalEl')
const previousFocus = ref(null)

function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  previousFocus.value = document.activeElement
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    if (modalRef.value) {
      const focusTarget = modalRef.value.querySelector('button, [tabindex="0"], input, select, textarea')
      if (focusTarget) {
        focusTarget.focus()
      } else {
        modalRef.value.focus()
      }
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
  if (previousFocus.value && typeof previousFocus.value.focus === 'function') {
    previousFocus.value.focus()
  }
})
</script>

<template>
  <div class="overlay" role="dialog" aria-modal="true" @click.self="$emit('close')">
    <div ref="modalEl" class="modal" :class="contentClass" :style="{ maxWidth }" tabindex="-1">
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
  outline: none;
}
</style>
