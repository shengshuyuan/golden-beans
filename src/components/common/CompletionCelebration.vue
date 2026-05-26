<script setup>
import { useRouter } from 'vue-router'

defineProps({
  todayEarned: { type: Number, required: true },
  maxStreak: { type: Number, required: true }
})

const router = useRouter()
</script>

<template>
  <section class="glass-panel completion-card">
    <div class="completion-icon">🎉</div>
    <h2 class="completion-title">今天收得很漂亮</h2>
    <div class="completion-stats">
      <div class="completion-stat">
        <span class="stat-label">获得金豆</span>
        <span class="stat-value">+{{ todayEarned }}</span>
      </div>
      <div class="completion-stat">
        <span class="stat-label">连续最高</span>
        <span class="stat-value">{{ maxStreak }} 天</span>
      </div>
    </div>
    <button class="primary-btn" @click="router.push('/rewards')">去看看奖励</button>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.completion-card {
  padding: 24px 20px;
  text-align: center;
  background: linear-gradient(135deg, #f0fff4 0%, #e6ffe6 100%);
  border: 2px solid #58d9bf;
}

.completion-icon {
  font-size: 48px;
}

.completion-title {
  margin-top: 12px;
  font-size: 22px;
  font-weight: 900;
  color: #20c7a3;
}

.completion-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 16px;
}

.completion-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: $text-secondary;
  font-weight: 600;
}

.stat-value {
  font-size: 20px;
  font-weight: 900;
  color: $primary-deep;
}

.primary-btn {
  @include button-primary;
  min-width: 200px;
  margin-top: 16px;
}
</style>
