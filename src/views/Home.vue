<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useHabitStore } from '../stores/habit'
import HabitCard from '../components/habit/HabitCard.vue'
import CheckSuccessModal from '../components/common/CheckSuccessModal.vue'
import GoldBeanCard from '../components/common/GoldBeanCard.vue'

const router = useRouter()
const userStore = useUserStore()
const habitStore = useHabitStore()

const showSuccessModal = ref(false)
const successData = ref({})
const activeTab = ref('pending')

const activeHabits = computed(() =>
  activeTab.value === 'pending' ? habitStore.todayPendingHabits : habitStore.todayCompletedHabits
)

const activeCount = computed(() => habitStore.habits.filter(habit => !habit.archived).length)
const isAllDoneToday = computed(() => activeCount.value > 0 && habitStore.todayPendingHabits.length === 0)

const emptyStateAction = computed(() => {
  if (activeCount.value === 0) {
    return {
      label: '创建第一个习惯',
      path: '/habits/new'
    }
  }

  if (activeTab.value === 'pending' && isAllDoneToday.value) {
    return {
      label: '去奖励页看看',
      path: '/rewards'
    }
  }

  return {
    label: '去习惯页看看',
    path: '/habits'
  }
})

function switchTab(tab) {
  activeTab.value = tab
}

function handleCheckIn(habit) {
  const result = habitStore.checkIn(habit.id)

  if (result.success) {
    successData.value = {
      habit,
      goldEarned: result.goldEarned,
      streakReward: result.streakReward,
      newStreak: result.newStreak,
      allCompleted: result.allCompleted
    }
    showSuccessModal.value = true
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
}

function goToHabit(habit) {
  router.push(`/habits/${habit.id}/edit`)
}
</script>

<template>
  <div class="home-page page-shell">
    <GoldBeanCard :gold="userStore.gold" />

    <section class="habits-panel glass-panel">
      <header class="panel-header">
        <div>
          <p class="eyebrow">今日习惯</p>
          <h1 class="panel-title">一步一步，今天也有进展</h1>
        </div>
        <button class="mini-link" @click="router.push('/habits')">查看全部</button>
      </header>

      <div class="tab-switcher">
        <button class="tab-btn" :class="{ active: activeTab === 'pending' }" @click="switchTab('pending')">
          待完成
          <span>{{ habitStore.todayPendingHabits.length }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'completed' }" @click="switchTab('completed')">
          已完成
          <span>{{ habitStore.todayCompletedHabits.length }}</span>
        </button>
      </div>

      <div v-if="activeHabits.length === 0" class="empty-state">
        <div class="empty-icon">{{ activeTab === 'pending' ? '🌤️' : '📝' }}</div>
        <h2 class="empty-title">
          {{ activeTab === 'pending' ? '今天的计划已经清空啦' : '还没有完成记录' }}
        </h2>
        <p class="empty-text" v-if="activeCount === 0">
          先创建一个习惯，开始积累你的第一颗金豆。
        </p>
        <p class="empty-text" v-else>
          {{ activeTab === 'pending' ? '继续保持，去奖励页看看想兑换什么吧。' : '完成一个习惯后，这里会出现今天的成果。' }}
        </p>
        <button class="empty-btn" @click="router.push(emptyStateAction.path)">
          {{ emptyStateAction.label }}
        </button>
      </div>

      <div v-else class="habit-list">
        <HabitCard
          v-for="habit in activeHabits"
          :key="habit.id"
          :habit="habit"
          :completed="activeTab === 'completed'"
          @check-in="handleCheckIn"
          @click="goToHabit"
        />
      </div>
    </section>

    <CheckSuccessModal v-if="showSuccessModal" :data="successData" @close="closeSuccessModal" />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.home-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.habits-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-header {
  @include flex-between;
  align-items: center;
  gap: 10px;
}

.eyebrow {
  margin-bottom: 4px;
  color: $primary-dark;
  font-size: 13px;
  font-weight: 700;
}

.panel-title {
  min-width: 0;
  font-size: clamp(16px, 4vw, 18px);
  line-height: 1.2;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-link {
  flex-shrink: 0;
  min-height: 32px;
  padding: 0 11px;
  border-radius: $radius-full;
  background: rgba(255, 241, 217, 0.9);
  color: $primary-dark;
  font-size: 12px;
  font-weight: 700;
}

.tab-switcher {
  display: inline-grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-xs;
  padding: 5px;
  background: rgba(249, 244, 236, 0.95);
  border-radius: 20px;
}

.tab-btn {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  color: $text-secondary;
  font-size: 13px;
  font-weight: 700;
  transition: background $transition-fast, color $transition-fast, box-shadow $transition-fast;

  span {
    min-width: 24px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.82);
    font-size: 11px;
  }

  &.active {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 247, 236, 0.95));
    color: $text-primary;
    box-shadow: 0 8px 18px rgba(125, 92, 47, 0.08);
  }
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.empty-state {
  padding: 8px 6px 2px;
  text-align: center;
}

.empty-icon {
  font-size: 34px;
  margin-bottom: 10px;
}

.empty-title {
  margin-bottom: 6px;
  font-size: 18px;
}

.empty-text {
  margin-bottom: 16px;
  color: $text-secondary;
  font-size: 12px;
  line-height: 1.45;
}

.empty-btn {
  @include button-primary;
  min-width: 180px;
  min-height: 42px;
  padding: 0 18px;
  font-size: 14px;
}

@media (max-width: 400px) {
  .panel-header {
    gap: 8px;
  }

  .panel-title {
    font-size: 15px;
  }

  .mini-link {
    min-height: 30px;
    padding: 0 10px;
    font-size: 11px;
  }
}
</style>
