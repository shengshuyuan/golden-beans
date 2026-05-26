<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: Number,
    default: 44
  },
  tilt: {
    type: Number,
    default: -10
  }
})

const iconStyle = computed(() => ({
  '--bean-size': `${props.size}px`,
  '--bean-tilt': `${props.tilt}deg`
}))
</script>

<template>
  <span class="bean" :style="iconStyle" aria-hidden="true">
    <span class="bean-inner"></span>
    <span class="sprout">
      <span class="leaf left"></span>
      <span class="leaf right"></span>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.bean {
  position: relative;
  display: inline-block;
  width: var(--bean-size);
  height: calc(var(--bean-size) * 1.15);
  transform: rotate(var(--bean-tilt));
}

.bean-inner {
  position: absolute;
  inset: 0;
  border-radius: 62% 46% 56% 44% / 58% 48% 56% 44%;
  background:
    linear-gradient(130deg, rgba(255, 245, 208, 0.96), rgba(255, 185, 88, 0.98) 48%, rgba(202, 99, 24, 0.96));
  box-shadow:
    inset 0 3px 5px rgba(255, 255, 255, 0.82),
    inset -7px -10px 14px rgba(152, 76, 10, 0.28),
    0 10px 20px rgba(220, 138, 40, 0.22);
}

.bean-inner::before,
.bean-inner::after {
  content: '';
  position: absolute;
  border-radius: 999px;
}

.bean-inner::before {
  top: 14%;
  left: 18%;
  width: 34%;
  height: 8%;
  background: rgba(176, 87, 15, 0.35);
  transform: rotate(-10deg);
}

.bean-inner::after {
  right: 12%;
  bottom: 18%;
  width: 26%;
  height: 8%;
  background: rgba(255, 248, 220, 0.52);
}

.sprout {
  position: absolute;
  inset: 0;
}

.sprout::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 47%;
  width: 8%;
  height: 17%;
  background: rgba(159, 82, 12, 0.58);
  border-radius: 999px;
  transform: translateX(-50%);
}

.leaf {
  position: absolute;
  top: 36%;
  width: 18%;
  height: 14%;
  border-radius: 100% 0 100% 0;
  border: 2px solid rgba(159, 82, 12, 0.58);
}

.leaf.left {
  left: 34%;
  transform: rotate(-38deg);
}

.leaf.right {
  right: 34%;
  transform: rotate(142deg);
}
</style>
