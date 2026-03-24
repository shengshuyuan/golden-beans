<script setup>
import { computed } from 'vue'
import { HABIT_TYPE_CONFIG, useHabitStore } from '../../stores/habit'

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
const typeConfig = computed(() => HABIT_TYPE_CONFIG[props.habit.type])
const streak = computed(() => habitStore.getStreakDays(props.habit.id))
const icon = computed(() => props.habit.icon || typeConfig.value.icon)
const cardStyle = computed(() => ({
  '--habit-color': typeConfig.value.color,
  '--habit-soft': `${typeConfig.value.color}26`
}))

function handleCheckIn(event) {
  event.stopPropagation()
  emit('checkIn', props.habit)
}

function handleClick() {
  emit('click', props.habit)
}
</script>

<template>
  <article class="habit-card" :class="{ completed }" :style="cardStyle" @click="handleClick">
    <div class="habit-icon">{{ icon }}</div>

    <div class="habit-info">
      <div class="habit-top">
        <h3 class="habit-name">{{ habit.name }}</h3>
        <span class="habit-type">{{ typeConfig.name }}</span>
      </div>

      <p v-if="habit.description" class="habit-desc">{{ habit.description }}</p>

      <div class="habit-meta">
        <span v-if="streak > 0" class="streak-pill">连续{{ streak }}天{{ streak >= 7 ? '🔥' : '' }}</span>
        <span v-else class="reward-pill">+{{ typeConfig.gold }}金豆/次</span>
        <span v-if="completed" class="status-pill">今日已完成</span>
      </div>
    </div>

    <button v-if="!completed" class="check-btn" @click="handleCheckIn">打卡</button>
    <div v-else class="checked-badge">✓</div>
  </article>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.habit-card {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 13px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow: $shadow-sm;
  transition: transform $transition-fast, box-shadow $transition-fast;

  &:active {
    transform: scale(0.985);
  }

  &.completed {
    background: rgba(255, 255, 255, 0.82);
  }
}

.habit-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 27px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.86), var(--habit-soft));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.habit-info {
  min-width: 0;
}

.habit-top {
  display: flex;
  align-items: flex-start;
  gap: $spacing-xs;
  margin-bottom: 4px;
}

.habit-name {
  flex: 1;
  min-width: 0;
  font-size: 18px;
  line-height: 1.2;
  @include text-ellipsis;
}

.habit-type {
  flex-shrink: 0;
  padding: 4px 9px;
  border-radius: $radius-full;
  font-size: 11px;
  font-weight: 700;
  color: var(--habit-color);
  background: var(--habit-soft);
}

.habit-desc {
  margin-bottom: $spacing-xs;
  font-size: 13px;
  line-height: 1.4;
  color: $text-secondary;
  @include text-clamp(2);
}

.habit-meta {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.streak-pill,
.reward-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: $radius-full;
  font-size: 11px;
  font-weight: 700;
}

.streak-pill {
  color: $primary-dark;
  background: rgba(255, 230, 191, 0.95);
}

.reward-pill {
  color: $text-secondary;
  background: rgba(246, 239, 224, 0.95);
}

.status-pill {
  color: $success-color;
  background: $success-soft;
}

.check-btn {
  @include button-primary;
  min-width: 68px;
  min-height: 40px;
  padding: 0 12px;
  font-size: 13px;
}

.checked-badge {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #58d9bf, #20c7a3);
  color: $text-white;
  font-size: 16px;
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(32, 199, 163, 0.24);
}

@media (max-width: 400px) {
  .habit-card {
    grid-template-columns: 48px minmax(0, 1fr) auto;
    gap: 10px;
    padding: 12px 11px;
  }

  .habit-icon {
    width: 48px;
    height: 48px;
    font-size: 25px;
  }

  .habit-name {
    font-size: 17px;
  }
}
</style>
