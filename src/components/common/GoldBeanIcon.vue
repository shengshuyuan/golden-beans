<script setup>
import beanMain from '@/assets/brand/gold-bean-main.png'
import beanToken from '@/assets/brand/gold-bean-token.svg'

const props = defineProps({
  size: {
    type: Number,
    default: 44
  },
  tilt: {
    type: Number,
    default: -10
  },
  active: {
    type: Boolean,
    default: false
  }
})

// 64px 以上用主图（更精细），以下用 token（更轻量）
const src = props.size >= 64 ? beanMain : beanToken
</script>

<template>
  <img
    :src="src"
    :width="size"
    :height="size"
    alt=""
    class="gold-bean-icon"
    :class="{ active }"
    :style="{ '--bean-tilt': `${tilt}deg` }"
    draggable="false"
  />
</template>

<style lang="scss" scoped>
.gold-bean-icon {
  display: inline-block;
  vertical-align: middle;
  object-fit: contain;
  transform: rotate(var(--bean-tilt, -10deg));
  filter: drop-shadow(0 2px 4px rgba(220, 138, 40, 0.25));
  flex-shrink: 0;
  pointer-events: none;
  user-select: none;
}

.gold-bean-icon.active {
  filter:
    drop-shadow(0 2px 4px rgba(220, 138, 40, 0.25))
    drop-shadow(0 0 6px rgba(255, 184, 0, 0.5));
}
</style>
