<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import GoldBeanIcon from './GoldBeanIcon.vue'

const props = defineProps({
  result: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

const rewards = computed(() => {
  if (!props.result) return []
  return [
    { label: '打卡奖励', value: props.result.baseGold || 0, icon: '🎯' },
    { label: '连续奖励', value: props.result.streakBonus || 0, icon: '🔥' },
    { label: '全清加成', value: props.result.allClearBonus || 0, icon: '⭐' }
  ].filter(item => item.value > 0)
})

// 里程碑判断
const milestone = computed(() => {
  if (!props.result?.newStreak) return null
  const streak = props.result.newStreak
  const milestones = [3, 7, 14, 21, 30, 60, 100, 180, 365]
  if (milestones.includes(streak)) {
    return { days: streak, message: `连续 ${streak} 天达成！` }
  }
  return null
})

// 是否有全清加成
const isAllClear = computed(() => (props.result?.allClearBonus || 0) > 0)

// 动画强度等级：normal < allClear < milestone
const animationLevel = computed(() => {
  if (milestone.value) return 'strong'
  if (isAllClear.value) return 'medium'
  return 'light'
})
</script>

<template>
  <BaseModal max-width="356px" content-class="success-modal" @close="$emit('close')">
    <div class="ribbon" :class="`ribbon-${animationLevel}`"></div>
    <div class="hero">
      <div class="hero-icon" :class="{ bounce: animationLevel !== 'light' }">{{ animationLevel === 'strong' ? '🎉' : '✨' }}</div>
      <h3 class="title">打卡成功</h3>
      <p class="subtitle">{{ result?.habit?.name || '今天又向前一步' }}</p>
    </div>

    <!-- 里程碑祝贺 -->
    <div v-if="milestone" class="milestone-banner">
      <div class="milestone-icon">🏆</div>
      <div class="milestone-text">{{ milestone.message }}</div>
    </div>

    <div class="gold-card" :class="{ 'gold-card-boost': animationLevel === 'strong' }">
      <GoldBeanIcon :size="animationLevel === 'strong' ? 48 : 40" :class="{ 'gold-icon-animate': animationLevel !== 'light' }" />
      <strong :class="{ 'gold-number-animate': animationLevel !== 'light' }">+{{ result?.totalGold || 0 }} 金豆</strong>
    </div>

    <div v-if="rewards.length > 0" class="reward-list">
      <div v-for="(item, index) in rewards" :key="item.label" class="reward-row" :style="{ animationDelay: `${index * 0.1}s` }">
        <span class="reward-icon">{{ item.icon }}</span>
        <span class="reward-label">{{ item.label }}</span>
        <strong class="reward-value">+{{ item.value }}</strong>
      </div>
    </div>

    <p class="hint">连续 {{ result?.newStreak || 0 }} 天，坚持正在变成你的日常。</p>
    <button class="primary-btn" @click="$emit('close')">太棒了</button>
  </BaseModal>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.success-modal {
  position: relative;
  overflow: hidden;
  padding: 22px 20px 20px;
  border-radius: 30px;
  text-align: center;
  animation: slideUp 0.4s ease;
}

.ribbon {
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #ffc664, #ff9b31);
}

.ribbon-strong {
  height: 8px;
  background: linear-gradient(90deg, #ff8d70, #ffc664, #78d9aa, #86a7ff, #f3a0d9);
}

.ribbon-medium {
  height: 7px;
  background: linear-gradient(90deg, #ffc664, #ff9b31, #ff8d70);
}

.hero-icon {
  font-size: 34px;
}

.bounce {
  animation: bounce 0.6s ease;
}

.title {
  margin-top: 8px;
  font-size: 26px;
}

.subtitle {
  margin-top: 6px;
  color: $text-secondary;
  font-size: 14px;
}

/* 里程碑祝贺 */
.milestone-banner {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 2px solid #ffb74d;
  animation: pulse 1s infinite;
}

.milestone-icon {
  font-size: 24px;
}

.milestone-text {
  margin-top: 4px;
  font-size: 16px;
  font-weight: 800;
  color: #e65100;
}

.gold-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 88px;
  margin-top: 16px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 248, 232, 0.96), rgba(255, 240, 210, 0.96));

  strong {
    color: $primary-deep;
    font-size: 32px;
    line-height: 1;
  }
}

.gold-card-boost {
  min-height: 100px;
  background: linear-gradient(180deg, rgba(255, 243, 214, 1), rgba(255, 224, 140, 1));
  border: 2px solid rgba(255, 180, 74, 0.4);

  strong {
    font-size: 38px;
  }
}

.gold-icon-animate {
  animation: goldSpin 0.8s ease;
}

.gold-number-animate {
  animation: goldPop 0.5s ease 0.3s both;
}

.reward-list {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.reward-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 18px;
  background: #fbf6ef;
  color: $text-secondary;
  font-size: 13px;
  font-weight: 700;
  animation: slideInRight 0.4s ease both;
}

.reward-icon {
  font-size: 16px;
}

.reward-label {
  flex: 1;
  text-align: left;
}

.reward-value {
  color: $primary-brown;
}

.hint {
  margin-top: 16px;
  color: $text-secondary;
  font-size: 14px;
}

.primary-btn {
  @include button-primary;
  width: 100%;
  margin-top: 16px;
}

/* 动画 */
@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes goldSpin {
  0% { transform: rotate(0deg) scale(0.5); opacity: 0; }
  100% { transform: rotate(360deg) scale(1); opacity: 1; }
}

@keyframes goldPop {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
