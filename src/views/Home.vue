<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHabitStore, HABIT_TYPE_CONFIG } from '../stores/habit'
import { useUserStore } from '../stores/user'
import { useRewardStore } from '../stores/reward'
import { useUiStore } from '../stores/ui'
import { getTodayString } from '../utils/date'
import HabitCard from '../components/habit/HabitCard.vue'
import ProgressRing from '../components/common/ProgressRing.vue'
import CompletionCelebration from '../components/common/CompletionCelebration.vue'
import CheckSuccessModal from '../components/common/CheckSuccessModal.vue'

const router = useRouter()
const habitStore = useHabitStore()
const userStore = useUserStore()
const rewardStore = useRewardStore()
const uiStore = useUiStore()

const currentTab = ref('pending')
const successResult = ref(null)

const today = computed(() => getTodayString())
const activeHabits = computed(() => habitStore.activeHabits)
const pendingHabits = computed(() => {
  const habits = habitStore.getPendingHabitsByDate(today.value)
  return habits.sort((a, b) => {
    const aCanMakeup = habitStore.canMakeup(a.id)
    const bCanMakeup = habitStore.canMakeup(b.id)
    if (aCanMakeup && !bCanMakeup) return -1
    if (!aCanMakeup && bCanMakeup) return 1
    return new Date(a.createdAt) - new Date(b.createdAt)
  })
})
const completedHabits = computed(() => habitStore.getCompletedHabitsByDate(today.value))

const pendingCount = computed(() => pendingHabits.value.length)
const completedCount = computed(() => completedHabits.value.length)
const activeCount = computed(() => activeHabits.value.length)
// 今日基础奖励（所有习惯的基础金豆总和）
const todayBaseReward = computed(() => {
  return activeHabits.value.reduce((sum, habit) => {
    const config = HABIT_TYPE_CONFIG[habit.type] || HABIT_TYPE_CONFIG.easy
    return sum + config.gold
  }, 0)
})

// 下一项待完成习惯
const nextHabit = computed(() => {
  if (pendingHabits.value.length === 0) return null
  return pendingHabits.value[0]
})

const nextHabitName = computed(() => nextHabit.value?.name || '')

// 今日已得金豆
const todayEarned = computed(() => {
  return completedHabits.value.reduce((sum, habit) => {
    const config = HABIT_TYPE_CONFIG[habit.type] || HABIT_TYPE_CONFIG.easy
    return sum + config.gold
  }, 0)
})

// 最高连续天数
const maxStreak = computed(() => {
  let max = 0
  activeHabits.value.forEach(habit => {
    max = Math.max(max, habitStore.getStreakDays(habit.id))
  })
  return max
})

// 问候语
const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 鼓励文案
const motivationalText = computed(() => {
  if (activeCount.value === 0) return '从一个小习惯开始吧'
  if (pendingCount.value === 0) return '今天收得很漂亮'
  if (completedCount.value === 0) return '先完成一个最小动作'
  if (completedCount.value < activeCount.value / 2) return '已经启动了，继续收尾'
  return '快完成了，再加把劲'
})

// 状态驱动 CTA
const nextGoalCta = computed(() => {
  const rewards = rewardStore.rewards
  const gold = userStore.gold

  // 有习惯但没有奖励
  if (activeCount.value > 0 && rewards.length === 0) {
    return {
      icon: '🎁',
      text: '设置一个奖励，让金豆有目标',
      action: () => router.push('/rewards/new')
    }
  }

  // 有奖励但金豆不够：找最近可兑换的
  if (rewards.length > 0) {
    const sorted = [...rewards].sort((a, b) => a.cost - b.cost)
    const nearest = sorted.find(r => r.cost > gold)
    if (nearest) {
      const deficit = nearest.cost - gold
      const avgGold = activeCount.value > 0 ? (HABIT_TYPE_CONFIG.easy.gold + HABIT_TYPE_CONFIG.effort.gold + HABIT_TYPE_CONFIG.challenge.gold) / 3 : 3
      const checkInsNeeded = Math.ceil(deficit / avgGold)
      return {
        icon: '🫘',
        text: `再完成 ${checkInsNeeded} 次可兑换「${nearest.name}」`,
        action: () => router.push('/rewards')
      }
    }
  }

  // 今天全完成且有可兑换奖励
  if (pendingCount.value === 0 && completedCount.value > 0) {
    const affordable = rewards.filter(r => r.cost <= gold)
    if (affordable.length > 0) {
      return {
        icon: '🎉',
        text: `去看看现在能兑换什么吧`,
        action: () => router.push('/rewards')
      }
    }
  }

  return null
})

const panelTitle = computed(() => {
  if (pendingCount.value === 0) return '一步一步，今天已经收得很好'
  return '一步一步，今天也有进展'
})

watch([pendingCount, completedCount, activeCount], ([pending, completed, total]) => {
  if (total === 0) {
    currentTab.value = 'pending'
    return
  }

  if (pending === 0 && completed > 0) {
    currentTab.value = 'completed'
    return
  }

  if (pending > 0 && currentTab.value === 'completed' && completed === 0) {
    currentTab.value = 'pending'
  }
})

function handleCheckIn(habit) {
  const result = habitStore.checkIn(habit.id)
  if (!result.success) {
    uiStore.showToast(result.message, 'error')
    return
  }
  successResult.value = result
}

function closeSuccessModal() {
  successResult.value = null
}
</script>

<template>
  <div class="home-page page-shell">
    <!-- 首屏：任务中心 -->
    <section class="hero-section">
      <div class="hero-top">
        <div class="hero-greeting">
          <h1 class="hero-title">{{ greetingText }}</h1>
          <p class="hero-subtitle">{{ motivationalText }}</p>
        </div>
        <button class="gold-pill" aria-label="查看金豆明细" @click="router.push('/gold-ledger')">
          <span class="gold-icon">🫘</span>
          <span class="gold-count">{{ userStore.gold }}</span>
        </button>
      </div>

      <!-- 今日进度环 -->
      <ProgressRing
        v-if="activeCount > 0"
        :completed-count="completedCount"
        :active-count="activeCount"
        :pending-count="pendingCount"
        :next-habit-name="nextHabitName"
        :today-base-reward="todayBaseReward"
      />

      <!-- 无习惯时 -->
      <div v-else class="empty-hero">
        <div class="empty-hero-icon">🌤️</div>
        <h2 class="empty-hero-title">今天的计划已经准备好了吗</h2>
        <p class="empty-hero-text">先创建一个小习惯，开始积累你的第一颗金豆。</p>
        <button class="primary-btn" @click="router.push('/habits/new')">创建第一个习惯</button>
      </div>
    </section>

    <!-- 状态驱动 CTA -->
    <button
      v-if="nextGoalCta && activeCount > 0"
      class="cta-banner"
      @click="nextGoalCta.action"
    >
      <span class="cta-icon">{{ nextGoalCta.icon }}</span>
      <span class="cta-text">{{ nextGoalCta.text }}</span>
    </button>

    <!-- 今日习惯列表 -->
    <section v-if="activeCount > 0" class="glass-panel habits-panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">今日习惯</p>
          <h1 class="panel-title">{{ panelTitle }}</h1>
        </div>
        <button class="head-btn" @click="router.push(pendingCount === 0 && activeCount > 0 ? '/rewards' : '/habits')">
          {{ pendingCount === 0 && activeCount > 0 ? '去奖励页' : '查看全部' }}
        </button>
      </div>

      <div class="tab-switch">
        <button class="tab-btn" :class="{ active: currentTab === 'pending' }" @click="currentTab = 'pending'">
          待完成 {{ pendingCount }}
        </button>
        <button class="tab-btn" :class="{ active: currentTab === 'completed' }" @click="currentTab = 'completed'">
          已完成 {{ completedCount }}
        </button>
      </div>

      <div v-if="currentTab === 'pending' && pendingHabits.length === 0" class="empty-state compact">
        <div class="empty-icon">🌤️</div>
        <h2 class="empty-title">今天的计划已经清空啦</h2>
        <p class="empty-text">继续保持，去奖励页看看想兑换什么吧。</p>
        <button class="primary-btn" @click="router.push('/rewards')">去奖励页看看</button>
      </div>

      <div v-else-if="currentTab === 'completed' && completedHabits.length === 0" class="empty-state compact">
        <div class="empty-icon">📝</div>
        <h2 class="empty-title">还没有完成记录</h2>
        <p class="empty-text">先完成一项今天的习惯，这里就会亮起来。</p>
      </div>

      <div v-else class="habit-list">
        <HabitCard
          v-for="habit in currentTab === 'pending' ? pendingHabits : completedHabits"
          :key="habit.id"
          :habit="habit"
          :completed="currentTab === 'completed'"
          @click="router.push(`/habits/${habit.id}/edit`)"
          @check-in="handleCheckIn"
        />
      </div>
    </section>

    <!-- 今日已完成收尾卡片 -->
    <CompletionCelebration
      v-if="activeCount > 0 && pendingCount === 0"
      :today-earned="todayEarned"
      :max-streak="maxStreak"
    />

    <CheckSuccessModal v-if="successResult" :result="successResult" @close="closeSuccessModal" />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.home-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 首屏：任务中心 */
.hero-section {
  padding: 20px;
  border-radius: $radius-2xl;
  background: linear-gradient(135deg, #fff8ef 0%, #fff4e2 100%);
  box-shadow: 0 12px 32px rgba(255, 155, 49, 0.15);
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.hero-greeting {
  flex: 1;
}

.hero-title {
  font-size: 28px;
  font-weight: 900;
  color: $text-primary;
  margin: 0;
}

.hero-subtitle {
  margin-top: 4px;
  font-size: 14px;
  color: $text-secondary;
  font-weight: 600;
}

.gold-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: $radius-full;
  background: linear-gradient(135deg, #ffc56e 0%, #ff9b31 100%);
  color: white;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(255, 155, 49, 0.3);
}

.gold-icon {
  font-size: 18px;
}

.gold-count {
  font-size: 16px;
}

/* 无习惯时 */
.empty-hero {
  text-align: center;
  padding: 20px 0;
}

.empty-hero-icon {
  font-size: 48px;
}

.empty-hero-title {
  margin-top: 12px;
  font-size: 20px;
  font-weight: 800;
}

.empty-hero-text {
  margin-top: 8px;
  font-size: 14px;
  color: $text-secondary;
}

/* 习惯列表 */
.habits-panel {
  padding: 18px 16px 18px;
}

.panel-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.eyebrow {
  margin: 0 0 4px;
  color: $primary-dark;
  font-size: 13px;
  font-weight: 800;
}

.panel-title {
  font-size: clamp(16px, 4vw, 18px);
  line-height: 1.2;
}

.head-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: $radius-full;
  background: rgba(255, 243, 214, 0.98);
  color: $primary-brown;
  font-size: 12px;
  font-weight: 800;
}

.tab-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
  padding: 6px;
  border-radius: 20px;
  background: #f6efe6;
}

.tab-btn {
  min-height: 42px;
  border-radius: 16px;
  color: $text-secondary;
  font-size: 14px;
  font-weight: 800;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.98);
  color: $text-primary;
  box-shadow: 0 6px 14px rgba(183, 129, 68, 0.1);
}

.habit-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.empty-state {
  padding: 22px 10px 6px;
  text-align: center;
}

.empty-state.compact {
  padding-bottom: 4px;
}

.empty-icon {
  font-size: 30px;
}

.empty-title {
  margin-top: 10px;
  font-size: 17px;
  line-height: 1.3;
}

.empty-text {
  margin-top: 8px;
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.6;
}

.primary-btn {
  @include button-primary;
  min-width: 200px;
  margin-top: 16px;
}

/* 状态驱动 CTA */
.cta-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, #fff8ef 0%, #ffecd2 100%);
  box-shadow: 0 4px 12px rgba(255, 155, 49, 0.12);
  text-align: left;
}

.cta-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.cta-text {
  font-size: 14px;
  font-weight: 700;
  color: $primary-deep;
}
</style>
