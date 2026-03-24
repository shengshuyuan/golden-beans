<script setup>
import { ref, computed } from 'vue'
import { HABIT_TYPE_CONFIG, useHabitStore } from '../../stores/habit'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  },
  archived: {
    type: Boolean,
    default: false
  },
  canMakeup: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'makeup', 'archive', 'restore', 'delete'])

const habitStore = useHabitStore()
const showActions = ref(false)

const typeConfig = computed(() => HABIT_TYPE_CONFIG[props.habit.type])
const streak = computed(() => habitStore.getStreakDays(props.habit.id))
const icon = computed(() => props.habit.icon || typeConfig.value.icon)
const cardStyle = computed(() => ({
  '--habit-color': typeConfig.value.color,
  '--habit-soft': `${typeConfig.value.color}24`
}))

let pressTimer = null

function handleTouchStart() {
  pressTimer = setTimeout(() => {
    showActions.value = true
  }, 450)
}

function handleTouchEnd() {
  clearTimeout(pressTimer)
}

function handleClick() {
  if (!props.archived) {
    emit('click', props.habit)
  }
}

function closeActions() {
  showActions.value = false
}

function handleAction(action) {
  emit(action, props.habit)
  closeActions()
}
</script>

<template>
  <article
    class="habit-item"
    :class="{ archived }"
    :style="cardStyle"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div class="habit-icon">{{ icon }}</div>

    <div class="habit-info">
      <div class="habit-row">
        <h3 class="habit-name">{{ habit.name }}</h3>
        <span class="streak-pill">{{ streak > 0 ? `连续${streak}天${streak >= 21 ? '🔥' : ''}` : `${typeConfig.name}` }}</span>
      </div>
      <p class="habit-desc">{{ habit.description || '给这项习惯设置一个小目标，保持节奏往前走。' }}</p>
      <div class="habit-actions" v-if="canMakeup && !archived">
        <button class="makeup-btn" @click.stop="emit('makeup', habit)">补卡</button>
      </div>
    </div>

    <button v-if="!archived" class="more-btn" @click.stop="showActions = true">•••</button>
    <span v-if="archived" class="archived-tag">已归档</span>

    <Teleport to="body">
      <div v-if="showActions" class="actions-overlay" @click="closeActions">
        <div class="actions-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="sheet-title">{{ habit.name }}</div>

          <button v-if="!archived" class="action-btn" @click="handleAction('archive')">归档这项习惯</button>
          <button v-if="archived" class="action-btn" @click="handleAction('restore')">恢复到进行中</button>
          <button class="action-btn danger" @click="handleAction('delete')">删除习惯</button>
          <button class="action-btn muted" @click="closeActions">取消</button>
        </div>
      </div>
    </Teleport>
  </article>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.habit-item {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: $spacing-sm;
  align-items: start;
  padding: 13px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.84);
  border-radius: 24px;
  box-shadow: $shadow-sm;
  transition: transform $transition-fast, box-shadow $transition-fast, opacity $transition-fast;

  &:active {
    transform: scale(0.985);
  }

  &.archived {
    opacity: 0.62;
    filter: saturate(0.55);
  }
}

.habit-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), var(--habit-soft));
}

.habit-info {
  min-width: 0;
}

.habit-row {
  display: flex;
  align-items: center;
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

.streak-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;
  min-height: 26px;
  padding: 0 9px;
  border-radius: $radius-full;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: $primary-brown;
  background: rgba(255, 229, 201, 0.95);
}

.habit-desc {
  font-size: 13px;
  line-height: 1.45;
  color: $text-secondary;
  @include text-clamp(2);
}

.habit-actions {
  margin-top: 10px;
}

.makeup-btn,
.more-btn,
.archived-tag {
  flex-shrink: 0;
}

.makeup-btn {
  min-width: 54px;
  min-height: 30px;
  padding: 0 9px;
  border-radius: $radius-full;
  background: rgba(255, 240, 215, 0.95);
  color: $primary-dark;
  font-size: 11px;
  font-weight: 700;
}

.more-btn {
  min-width: 30px;
  min-height: 30px;
  align-self: center;
  color: $text-secondary;
  font-size: 17px;
  letter-spacing: 1px;
}

.archived-tag {
  min-height: 30px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  align-self: center;
  border-radius: $radius-full;
  background: rgba(215, 215, 215, 0.82);
  color: #6f6f6f;
  font-size: $font-xs;
  font-weight: 700;
}

.actions-overlay {
  position: fixed;
  inset: 0;
  background: rgba(23, 17, 12, 0.42);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 20px 16px;
  z-index: 1000;
}

.actions-sheet {
  width: 100%;
  max-width: 448px;
  padding: 12px 12px 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: $shadow-lg;
  backdrop-filter: blur(22px);
}

.sheet-handle {
  width: 52px;
  height: 5px;
  margin: 0 auto 12px;
  border-radius: $radius-full;
  background: rgba(191, 169, 145, 0.6);
}

.sheet-title {
  margin-bottom: $spacing-sm;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
}

.action-btn {
  width: 100%;
  min-height: 48px;
  margin-top: $spacing-xs;
  border-radius: 20px;
  background: rgba(248, 243, 236, 0.95);
  color: $text-primary;
  font-size: 15px;
  font-weight: 700;

  &.danger {
    color: $danger-color;
    background: $danger-soft;
  }

  &.muted {
    color: $text-secondary;
  }
}

@media (max-width: 400px) {
  .habit-item {
    gap: 10px;
    padding: 12px;
  }

  .habit-name {
    font-size: 17px;
  }

  .habit-desc {
    font-size: 13px;
  }

  .streak-pill {
    font-size: 11px;
  }
}
</style>
