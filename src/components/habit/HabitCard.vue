<script setup>
import { computed } from 'vue'
import { HABIT_TYPE_CONFIG, STREAK_REWARD_TIERS, useHabitStore } from '../../stores/habit'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['checkIn', 'click'])

const habitStore = useHabitStore()
const typeConfig = computed(() => HABIT_TYPE_CONFIG[props.habit.type] || HABIT_TYPE_CONFIG.easy)
const streak = computed(() => habitStore.getStreakDays(props.habit.id))

// 下一个里程碑
const nextMilestone = computed(() => {
  if (streak.value <= 0) return null
  const next = STREAK_REWARD_TIERS.find(t => t.days > streak.value)
  return next || null
})

// 距离下一个里程碑还差几天
const daysToMilestone = computed(() => {
  if (!nextMilestone.value) return 0
  return nextMilestone.value.days - streak.value
})

function handleCheckIn(event) {
  event.stopPropagation()
  emit('checkIn', props.habit)
}
</script>

<template>
  <article class="habit-card" :class="{ completed }" @click="$emit('click', habit)">
    <div class="habit-icon">{{ habit.icon || typeConfig.icon }}</div>

    <div class="habit-info">
      <div class="habit-top">
        <h3 class="habit-name">{{ habit.name }}</h3>
        <span class="habit-type">{{ typeConfig.name }}</span>
      </div>
      <p v-if="habit.description" class="habit-desc">{{ habit.description }}</p>
      <div class="habit-meta">
        <span v-if="streak > 0" class="streak-pill">连续{{ streak }}天</span>
        <span v-else class="reward-pill">+{{ typeConfig.gold }} 金豆</span>
        <span v-if="completed" class="done-pill">今日完成</span>
      </div>
      <p v-if="!completed && streak > 0 && nextMilestone" class="streak-hint">
        再 {{ daysToMilestone }} 天冲 {{ nextMilestone.days }} 天奖励
      </p>
    </div>

    <button v-if="!completed" class="check-btn" @click="handleCheckIn">
      <span class="check-text">打卡</span>
      <span class="check-reward">+{{ typeConfig.gold }}</span>
    </button>
    <div v-else class="checked-mark">✓</div>
  </article>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.habit-card {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 13px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: $shadow-sm;
}

.habit-card.completed {
  background: rgba(255, 255, 255, 0.84);
}

.habit-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(180deg, #e8faf0, #c8f5dc);
  font-size: 27px;
}

.habit-info {
  min-width: 0;
}

.habit-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.habit-name {
  flex: 1;
  min-width: 0;
  font-size: 18px;
  line-height: 1.22;
  @include text-ellipsis;
}

.habit-type,
.streak-pill,
.reward-pill,
.done-pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: $radius-full;
  font-size: 11px;
  font-weight: 800;
}

.habit-type {
  color: #1b8a5a;
  background: rgba(200, 245, 220, 0.96);
}

.habit-desc {
  margin: 4px 0 0;
  color: $text-secondary;
  font-size: 13px;
}

.habit-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.streak-pill {
  background: rgba(200, 245, 220, 0.96);
  color: #1b8a5a;
}

.reward-pill {
  background: #f4eee6;
  color: $text-secondary;
}

.done-pill {
  background: $success-soft;
  color: $success-color;
}

.streak-hint {
  margin: 4px 0 0;
  font-size: 11px;
  color: $primary-brown;
  font-weight: 700;
}

.check-btn {
  @include button-primary;
  min-width: 80px;
  min-height: 40px;
  padding: 0 12px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.check-text {
  font-size: 13px;
  font-weight: 800;
}

.check-reward {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.8;
}

.checked-mark {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(180deg, #58d9bf, #20c7a3);
  color: $text-white;
  font-weight: 900;
}
</style>
