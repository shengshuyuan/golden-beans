import { defineStore } from 'pinia'

let toastTimer = null

export const useUiStore = defineStore('ui', {
  state: () => ({
    toast: {
      visible: false,
      message: '',
      type: 'success'
    }
  }),

  actions: {
    showToast(message, type = 'success', duration = 2200) {
      this.toast = {
        visible: true,
        message,
        type
      }

      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        this.hideToast()
      }, duration)
    },

    hideToast() {
      this.toast.visible = false
    }
  }
})
