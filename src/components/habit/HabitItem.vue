<script setup>
import { computed, ref } from 'vue'
import { HABIT_TYPE_CONFIG, useHabitStore } from '../../stores/habit'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  },
  canMakeup: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'makeup', 'archive', 'delete', 'restore'])

const showSheet = ref(false)
const habitStore = useHabitStore()
const typeConfig = computed(() => HABIT_TYPE_CONFIG[props.habit.type] || HABIT_TYPE_CONFIG.easy)
const streak = computed(() => habitStore.getStreakDays(props.habit.id))
const makeupCost = computed(() => typeConfig.value.gold * 2)
</script>

<template>
  <div class="habit-item">
    <article class="habit-card" @click="$emit('click', habit)">
      <div class="habit-icon">{{ habit.icon || typeConfig.icon }}</div>

      <div class="habit-content">
        <div class="habit-row">
          <h3 class="habit-name">{{ habit.name }}</h3>
          <span class="streak-pill">{{ streak > 0 ? `连续${streak}天` : typeConfig.name }}</span>
        </div>
        <p class="habit-desc">{{ habit.description || `${habit.name}，继续保持节奏。` }}</p>

        <button
          v-if="canMakeup && !archived"
          class="makeup-btn"
          @click.stop="$emit('makeup', habit)"
        >
          补卡 -{{ makeupCost }}
        </button>
      </div>

      <button class="more-btn" aria-label="更多操作" @click.stop="showSheet = true">•••</button>
    </article>

    <div v-if="showSheet" class="sheet-mask" @click.self="showSheet = false">
      <div class="sheet">
        <div class="sheet-title">{{ habit.name }}</div>

        <button
          v-if="archived"
          class="sheet-btn"
          @click="$emit('restore', habit); showSheet = false"
        >
          恢复到进行中
        </button>
        <button
          v-else
          class="sheet-btn"
          @click="$emit('archive', habit); showSheet = false"
        >
          归档这项习惯
        </button>
        <button class="sheet-btn danger" @click="$emit('delete', habit); showSheet = false">删除习惯</button>
        <button class="sheet-btn cancel" @click="showSheet = false">取消</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.habit-card {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 36px;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: $shadow-sm;
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

.habit-content {
  min-width: 0;
}

.habit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.habit-name {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  line-height: 1.2;
}

.streak-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: $radius-full;
  background: rgba(200, 245, 220, 0.96);
  color: #1b8a5a;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.habit-desc {
  margin: 4px 0 0;
  color: $text-secondary;
  font-size: 13px;
}

.makeup-btn {
  margin-top: 10px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: $radius-full;
  background: rgba(221, 91, 80, 0.1);
  color: #c0392b;
  font-size: 12px;
  font-weight: 800;
}

.more-btn {
  color: $text-secondary;
  font-size: 18px;
  font-weight: 900;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 45;
  display: flex;
  align-items: flex-end;
  background: rgba(44, 29, 12, 0.28);
}

.sheet {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 16px 14px calc(20px + env(safe-area-inset-bottom, 0px));
  border-radius: 28px 28px 0 0;
  background: rgba(255, 255, 255, 0.98);
}

.sheet-title {
  margin-bottom: 12px;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
}

.sheet-btn {
  width: 100%;
  min-height: 46px;
  margin-top: 8px;
  border-radius: 18px;
  background: #f6efe6;
  color: $text-primary;
  font-size: 15px;
  font-weight: 800;
}

.sheet-btn.danger {
  background: rgba(221, 91, 80, 0.12);
  color: $danger-color;
}

.sheet-btn.cancel {
  background: transparent;
  color: $text-secondary;
}
</style>
