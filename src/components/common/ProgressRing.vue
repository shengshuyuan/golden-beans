<script setup>
import { computed } from 'vue'

const props = defineProps({
  completedCount: { type: Number, required: true },
  activeCount: { type: Number, required: true },
  pendingCount: { type: Number, required: true },
  nextHabitName: { type: String, default: '' },
  todayBaseReward: { type: Number, default: 0 }
})

const completionRatio = computed(() => {
  if (props.activeCount === 0) return 0
  return Math.round((props.completedCount / props.activeCount) * 100)
})

const progressOffset = computed(() => {
  const circumference = 2 * Math.PI * 52
  return circumference - (completionRatio.value / 100) * circumference
})
</script>

<template>
  <div class="progress-ring-section">
    <div class="progress-ring-container">
      <svg class="progress-ring" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ffbf61" />
            <stop offset="100%" style="stop-color:#ff922f" />
          </linearGradient>
        </defs>
        <circle class="progress-ring-bg" cx="60" cy="60" r="52" />
        <circle class="progress-ring-fill" cx="60" cy="60" r="52" :style="{ strokeDashoffset: progressOffset }" />
      </svg>
      <div class="progress-ring-content">
        <span class="progress-ring-number">{{ completedCount }}</span>
        <span class="progress-ring-label">/{{ activeCount }}</span>
      </div>
    </div>
    <div class="progress-info">
      <div class="progress-status">
        <span v-if="pendingCount > 0" class="status-pending">还差 {{ pendingCount }} 项</span>
        <span v-else class="status-done">今日全部完成！</span>
      </div>
      <div v-if="nextHabitName" class="next-action">
        <span class="next-label">下一项</span>
        <span class="next-name">{{ nextHabitName }}</span>
      </div>
      <div class="progress-reward">
        <span class="reward-text">{{ pendingCount > 0 ? '完成剩余可得' : '今日基础奖励' }}</span>
        <span class="reward-value">+{{ todayBaseReward }} 金豆</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.progress-ring-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
}

.progress-ring-container {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: #f1e8dc;
  stroke-width: 8;
}

.progress-ring-fill {
  fill: none;
  stroke: url(#progressGradient);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 326.73;
  transition: stroke-dashoffset 0.6s ease;
}

.progress-ring-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring-number {
  font-size: 28px;
  font-weight: 900;
  color: $primary-deep;
}

.progress-ring-label {
  font-size: 16px;
  color: $text-secondary;
  font-weight: 600;
}

.progress-info {
  flex: 1;
}

.progress-status {
  margin-bottom: 6px;
}

.next-action {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.next-label {
  font-size: 11px;
  color: $text-light;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 180, 74, 0.15);
}

.next-name {
  font-size: 13px;
  font-weight: 700;
  color: $text-primary;
  @include text-ellipsis;
}

.status-pending {
  font-size: 18px;
  font-weight: 800;
  color: $primary-deep;
}

.status-done {
  font-size: 18px;
  font-weight: 800;
  color: #20c7a3;
}

.progress-reward {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reward-text {
  font-size: 13px;
  color: $text-secondary;
}

.reward-value {
  font-size: 16px;
  font-weight: 800;
  color: $primary-brown;
}
</style>
