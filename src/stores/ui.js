import { defineStore } from 'pinia'
import { ref } from 'vue'

let toastTimer = null

export const useUiStore = defineStore('ui', () => {
  const toast = ref({
    visible: false,
    message: '',
    type: 'info'
  })

  function showToast(message, type = 'info', duration = 2200) {
    toast.value = {
      visible: true,
      message,
      type
    }

    if (toastTimer) {
      clearTimeout(toastTimer)
    }

    toastTimer = window.setTimeout(() => {
      hideToast()
    }, duration)
  }

  function hideToast() {
    toast.value.visible = false
  }

  return {
    toast,
    showToast,
    hideToast
  }
})
