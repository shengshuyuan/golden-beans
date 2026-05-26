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
</script>

<template>
  <section class="gold-hero">
    <button class="detail-pill" @click="router.push('/gold-ledger')">
      <GoldBeanIcon :size="16" />
      查看明细
    </button>

    <div class="hero-bean">
      <GoldBeanIcon :size="98" />
    </div>
    <div class="hero-count">{{ gold }}</div>
    <div class="hero-caption">当前可用金豆</div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.gold-hero {
  position: relative;
  overflow: hidden;
  padding: 22px 20px 26px;
  border-radius: $radius-2xl;
  background:
    radial-gradient(circle at 26% 18%, rgba(255, 233, 177, 0.3), transparent 24%),
    radial-gradient(circle at 86% 22%, rgba(255, 193, 106, 0.2), transparent 18%),
    linear-gradient(165deg, #ffc56e 0%, #ff9b31 48%, #ff9127 100%);
  box-shadow: 0 28px 56px rgba(255, 155, 49, 0.28);
  text-align: center;
}

.gold-hero::after {
  content: '';
  position: absolute;
  right: -36%;
  bottom: -38%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.detail-pill {
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: $radius-full;
  background: rgba(126, 66, 18, 0.18);
  color: $text-white;
  font-size: 13px;
  font-weight: 800;
}

.hero-bean {
  display: flex;
  justify-content: center;
  margin: 10px 0 10px;
}

.hero-count {
  position: relative;
  z-index: 1;
  font-size: clamp(48px, 13vw, 60px);
  line-height: 1;
  font-weight: 900;
  color: $text-white;
}

.hero-caption {
  position: relative;
  z-index: 1;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 15px;
  font-weight: 700;
}
</style>
