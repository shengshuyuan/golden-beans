<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import GoldBeanIcon from './GoldBeanIcon.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const showContent = ref(false)
const totalGold = ref(0)
let timer = null

const rewardItems = computed(() => {
  const items = [
    { label: '打卡奖励', value: props.data.goldEarned }
  ]

  if (props.data.streakReward) {
    items.push({ label: '连续奖励', value: props.data.streakReward })
  }

  if (props.data.allCompleted) {
    items.push({ label: '全清加成', value: 3 })
  }

  return items
})

const hintText = computed(() => {
  if (props.data.allCompleted) {
    return '今天的习惯已经全部完成，继续保持。'
  }

  if (props.data.newStreak >= 7) {
    return `连续打卡 ${props.data.newStreak} 天，状态很稳。`
  }

  return '完成一次，就离理想的自己更近一点。'
})

onMounted(() => {
  showContent.value = true

  const target = props.data.goldEarned + (props.data.streakReward || 0) + (props.data.allCompleted ? 3 : 0)
  let current = 0
  const step = Math.max(1, Math.ceil(target / 18))

  timer = window.setInterval(() => {
    current += step
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    totalGold.value = current
  }, 36)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-card" :class="{ show: showContent }">
        <div class="celebration-strip">
          <span v-for="item in 10" :key="item" class="strip-dot"></span>
        </div>

        <div class="badge-shell">
          <div class="icon-badge">🎉</div>
        </div>

        <h2 class="modal-title">打卡成功</h2>
        <p class="modal-subtitle">{{ data.habit?.name || '习惯完成' }}</p>

        <div class="reward-box">
          <div class="reward-label">
            <GoldBeanIcon :size="16" :tilt="-10" />
            本次获得
          </div>
          <div class="reward-value">+{{ totalGold }} 金豆</div>
        </div>

        <div class="reward-breakdown">
          <span v-for="item in rewardItems" :key="item.label" class="reward-chip">
            {{ item.label }} +{{ item.value }}
          </span>
        </div>

        <p class="hint-text">{{ hintText }}</p>

        <button class="confirm-btn" @click="emit('close')">太棒了</button>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(27, 20, 13, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-card {
  position: relative;
  width: min(calc(100vw - 32px), 360px);
  overflow: hidden;
  padding: 18px 18px 18px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 249, 240, 0.98) 0%, rgba(255, 255, 255, 0.98) 22%),
    rgba(255, 255, 255, 0.98);
  text-align: center;
  box-shadow: $shadow-lg;
  transform: translateY(16px) scale(0.95);
  opacity: 0;
  transition: transform $transition-normal, opacity $transition-normal;
  border: 1px solid rgba(255, 255, 255, 0.85);

  &.show {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.celebration-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -4px -2px 10px;
}

.strip-dot {
  width: 12px;
  height: 8px;
  border-radius: 999px;
  transform: rotate(-28deg);
}

.strip-dot:nth-child(5n + 1) { background: #ff7b67; }
.strip-dot:nth-child(5n + 2) { background: #ffb650; }
.strip-dot:nth-child(5n + 3) { background: #75d895; }
.strip-dot:nth-child(5n + 4) { background: #71a9ff; }
.strip-dot:nth-child(5n) { background: #f48ec4; }

.badge-shell {
  width: 84px;
  height: 84px;
  margin: 0 auto 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.92), rgba(255, 240, 202, 0.92)),
    linear-gradient(180deg, rgba(255, 216, 144, 0.6), rgba(255, 178, 72, 0.5));
  box-shadow:
    inset 0 0 0 8px rgba(255, 247, 226, 0.8),
    0 16px 34px rgba(255, 159, 67, 0.18);
}

.icon-badge {
  font-size: 40px;
}

.modal-title {
  margin-bottom: 6px;
  font-size: 22px;
  color: $primary-brown;
}

.modal-subtitle {
  margin-bottom: 16px;
  color: $text-secondary;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.reward-box {
  padding: 16px 14px;
  border-radius: 22px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.75), transparent 34%),
    linear-gradient(180deg, rgba(255, 244, 223, 0.98), rgba(255, 248, 238, 0.98));
  box-shadow: inset 0 0 0 1px rgba(255, 233, 194, 0.8);
}

.reward-label {
  margin-bottom: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: $text-secondary;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.reward-value {
  color: $primary-color;
  font-size: clamp(30px, 8vw, 40px);
  line-height: 1;
  font-weight: 900;
}

.reward-breakdown {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 14px 0 12px;
}

.reward-chip {
  min-height: 28px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(255, 246, 228, 0.95);
  color: $primary-brown;
  font-size: 12px;
  font-weight: 700;
}

.hint-text {
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: $primary-brown;
}

.confirm-btn {
  @include button-primary;
  width: 100%;
  min-height: 50px;
  font-size: 17px;
}

@media (max-width: 400px) {
  .modal-overlay {
    padding: 14px;
  }

  .modal-card {
    width: min(calc(100vw - 28px), 344px);
    padding: 16px 16px 16px;
    border-radius: 24px;
  }

  .badge-shell {
    width: 76px;
    height: 76px;
  }

  .modal-title {
    font-size: 20px;
  }

  .reward-value {
    font-size: 34px;
  }
}
</style>
