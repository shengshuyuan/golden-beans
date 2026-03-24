<script setup>
import { useRouter } from 'vue-router'
import GoldBeanIcon from './GoldBeanIcon.vue'

defineProps({
  gold: {
    type: Number,
    default: 0
  }
})

const router = useRouter()

function goToStats() {
  router.push('/stats')
}
</script>

<template>
  <section class="gold-hero">
    <button class="detail-pill" @click="goToStats">
      <GoldBeanIcon class="detail-icon" :size="16" :tilt="-10" />
      金豆明细
    </button>

    <div class="hero-bean">
      <GoldBeanIcon :size="128" :tilt="-12" />
    </div>

    <div class="hero-count">{{ gold }}</div>
    <div class="hero-caption">当前可用金豆</div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.gold-hero {
  position: relative;
  overflow: hidden;
  padding: 24px 22px 28px;
  border-radius: $radius-2xl;
  background:
    radial-gradient(circle at 25% 20%, rgba(255, 220, 139, 0.35), transparent 28%),
    radial-gradient(circle at 85% 20%, rgba(255, 208, 128, 0.2), transparent 25%),
    linear-gradient(160deg, #ffbf67 0%, $primary-color 35%, #ff9a31 100%);
  box-shadow: 0 28px 55px rgba(255, 154, 49, 0.32);
  text-align: center;
}

.gold-hero::after {
  content: '';
  position: absolute;
  inset: auto -40% -35% auto;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.detail-pill {
  position: absolute;
  top: 16px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px 0 10px;
  border-radius: $radius-full;
  background: rgba(123, 63, 16, 0.18);
  color: $text-white;
  font-size: 13px;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.detail-icon {
  flex-shrink: 0;
}

.hero-bean {
  position: relative;
  width: 132px;
  height: 116px;
  margin: 8px auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-bean::before {
  content: '';
  position: absolute;
  inset: 4px 8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 248, 230, 0.38), rgba(255, 248, 230, 0) 68%);
  filter: blur(6px);
}

.hero-bean::after,
.detail-pill::after {
  position: absolute;
  content: '';
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.72);
}

.hero-bean::after {
  top: 18px;
  left: 16px;
  width: 8px;
  height: 8px;
}

.detail-pill::after {
  right: 10px;
  top: 8px;
  width: 4px;
  height: 4px;
  opacity: 0.72;
}

.hero-count {
  position: relative;
  z-index: 1;
  font-size: clamp(56px, 14vw, 66px);
  line-height: 1;
  font-weight: 900;
  color: $text-white;
  text-shadow: 0 8px 20px rgba(134, 65, 0, 0.22);
}

.hero-caption {
  position: relative;
  z-index: 1;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 15px;
  font-weight: 700;
}
</style>
