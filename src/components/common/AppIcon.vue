<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 22
  }
})

const icons = {
  home: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  gift: `<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>`,
  coin: `<circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5"/>`,
  chart: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
  plus: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  back: `<polyline points="15 18 9 12 15 6"/>`,
  arrow: `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  check: `<polyline points="20 6 9 17 4 12"/>`
}
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <g v-html="icons[name] || icons.home" />
  </svg>
</template>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
