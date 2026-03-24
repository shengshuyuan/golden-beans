<script setup>
import { ref, computed } from 'vue'
import { useHabitStore, HABIT_TYPE_CONFIG } from '../stores/habit'
import { useUserStore } from '../stores/user'
import { getCalendarData, getTodayString } from '../utils/date'
import GoldBeanIcon from '../components/common/GoldBeanIcon.vue'

const habitStore = useHabitStore()
const userStore = useUserStore()

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const currentDate = ref(new Date())

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthLabel = computed(() => `${currentYear.value}年${currentMonth.value + 1}月`)

const activeHabits = computed(() => habitStore.habits.filter(habit => !habit.archived))
const calendarData = computed(() => getCalendarData(currentYear.value, currentMonth.value))
const today = getTodayString()

const monthCompletion = computed(() => {
  const currentMonthDays = calendarData.value.filter(day => day.isCurrentMonth)
  const completedDays = currentMonthDays.filter(day => ['all', 'all-makeup'].includes(getDayStatus(day.date))).length

  return {
    completedDays,
    totalDays: currentMonthDays.length
  }
})

const statistics = computed(() => {
  const userStats = userStore.getStatistics()
  let totalChecks = 0
  let currentStreak = 0
  let longestStreak = 0

  activeHabits.value.forEach(habit => {
    const records = habitStore.checkRecords[habit.id] || {}
    totalChecks += Object.values(records).filter(record => record.checked).length

    const streak = habitStore.getStreakDays(habit.id)
    currentStreak = Math.max(currentStreak, streak)
    longestStreak = Math.max(longestStreak, getLongestStreak(records))
  })

  return {
    totalChecks,
    longestStreak,
    currentStreak,
    totalGold: userStats.totalEarned || userStore.gold
  }
})

const habitStats = computed(() => {
  return activeHabits.value.map(habit => {
    const records = habitStore.checkRecords[habit.id] || {}
    
    // 计算总天数：从习惯创建日期到今天
    const createdAt = new Date(habit.createdAt || Date.now())
    // 抹平时间，只比较日期
    createdAt.setHours(0, 0, 0, 0)
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    
    const diffTime = Math.abs(todayDate - createdAt)
    // 至少为1天（今天创建的算1天）
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1)
    
    const checkedDays = Object.values(records).filter(record => record.checked).length
    const rate = Math.min(100, Math.round((checkedDays / totalDays) * 100))

    return {
      ...habit,
      rate,
      streak: habitStore.getStreakDays(habit.id)
    }
  })
})

function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

function getDayStatus(date) {
  const habits = activeHabits.value
  if (habits.length === 0) return 'none'

  let checkedCount = 0
  let makeupCount = 0

  habits.forEach(habit => {
    const record = habitStore.getCheckRecord(habit.id, date)
    if (record.checked) {
      checkedCount += 1
      if (record.isMakeup) {
        makeupCount += 1
      }
    }
  })

  if (checkedCount === habits.length) {
    return makeupCount > 0 ? 'all-makeup' : 'all'
  }

  if (checkedCount > 0) {
    return 'partial'
  }

  return 'none'
}

function getLongestStreak(records) {
  const checkedDates = Object.entries(records)
    .filter(([, record]) => record.checked)
    .map(([date]) => date)
    .sort()

  if (checkedDates.length === 0) {
    return 0
  }

  let best = 1
  let current = 1

  for (let index = 1; index < checkedDates.length; index += 1) {
    const prevDate = new Date(checkedDates[index - 1])
    const currentDate = new Date(checkedDates[index])
    const diff = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24))

    if (diff === 1) {
      current += 1
      best = Math.max(best, current)
    } else if (diff > 1) {
      current = 1
    }
  }

  return best
}

function dayClass(day) {
  return {
    'other-month': !day.isCurrentMonth,
    today: day.date === today,
    all: getDayStatus(day.date) === 'all',
    partial: getDayStatus(day.date) === 'partial',
    'all-makeup': getDayStatus(day.date) === 'all-makeup'
  }
}
</script>

<template>
  <div class="stats-page page-shell">
    <header class="page-header">
      <h1 class="page-title">我的数据</h1>
      <div class="month-switcher">
        <button class="month-btn" @click="prevMonth">‹</button>
        <span class="month-title">{{ currentMonthLabel }}</span>
        <button class="month-btn" @click="nextMonth">›</button>
      </div>
    </header>

    <section class="calendar-card glass-panel">
      <div class="weekday-row">
        <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
      </div>

      <div class="calendar-grid">
        <div v-for="(day, index) in calendarData" :key="index" class="calendar-day" :class="dayClass(day)">
          <span class="day-number">{{ day.day }}</span>
          <span v-if="getDayStatus(day.date) !== 'none'" class="day-dot"></span>
        </div>
      </div>

      <div class="calendar-footer">完成{{ monthCompletion.completedDays }}/{{ monthCompletion.totalDays }}天</div>
    </section>

    <section class="stats-grid">
      <article class="stat-card glass-panel">
        <div class="stat-title">总打卡次数</div>
        <div class="stat-value">{{ statistics.totalChecks }}次</div>
        <div class="stat-emoji">🗓️</div>
      </article>
      <article class="stat-card glass-panel">
        <div class="stat-title">最长连续</div>
        <div class="stat-value">{{ statistics.longestStreak }}天</div>
        <div class="stat-emoji">🏆</div>
      </article>
      <article class="stat-card glass-panel">
        <div class="stat-title">当前连续</div>
        <div class="stat-value">{{ statistics.currentStreak }}天🔥</div>
        <div class="stat-emoji">🌱</div>
      </article>
      <article class="stat-card glass-panel">
        <div class="stat-title">累计金豆</div>
        <div class="stat-value">{{ statistics.totalGold }}颗</div>
        <div class="stat-emoji bean-emoji">
          <GoldBeanIcon :size="28" :tilt="-12" />
        </div>
      </article>
    </section>

    <section class="rate-card glass-panel">
      <h2 class="section-title">习惯完成率</h2>

      <div v-if="habitStats.length === 0" class="empty-state">还没有习惯数据</div>

      <div v-else class="rate-list">
        <article v-for="habit in habitStats" :key="habit.id" class="rate-item">
          <div class="rate-header">
            <span class="rate-name">
              {{ habit.icon || HABIT_TYPE_CONFIG[habit.type]?.icon }}
              {{ habit.name }}
            </span>
            <span class="rate-value">{{ habit.rate }}%</span>
          </div>
          <div class="rate-bar">
            <div class="rate-progress" :style="{ width: `${habit.rate}%`, backgroundColor: HABIT_TYPE_CONFIG[habit.type]?.color }"></div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.stats-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.page-title {
  font-size: clamp(28px, 6.6vw, 34px);
  line-height: 1.12;
}

.month-switcher {
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  min-height: 50px;
  padding: 0 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: $shadow-sm;
}

.month-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 248, 238, 0.95);
  font-size: 22px;
  line-height: 1;
  color: $primary-brown;
}

.month-title {
  font-size: 18px;
  font-weight: 800;
}

.calendar-card {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  overflow: hidden;
}

.calendar-day {
  aspect-ratio: 1;
  position: relative;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.other-month {
    opacity: 0.35;
  }

  &.today {
    box-shadow: inset 0 0 0 3px rgba(255, 165, 59, 0.9);
  }

  &.all {
    background: rgba(32, 199, 163, 0.16);

    .day-number {
      color: $success-color;
      font-weight: 900;
    }
  }

  &.partial,
  &.all-makeup {
    .day-number {
      color: $text-primary;
      font-weight: 900;
    }
  }

  &.partial .day-dot,
  &.all-makeup .day-dot {
    background: $primary-color;
  }
}

.day-number {
  font-size: clamp(12px, 3.3vw, 15px);
}

.day-dot {
  position: absolute;
  bottom: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.calendar-footer {
  text-align: right;
  font-size: 15px;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-md;
}

.stat-card {
  position: relative;
  min-height: 128px;
  overflow: hidden;
  padding-right: 56px;
}

.stat-title {
  margin-bottom: 10px;
  color: $text-primary;
  font-size: 15px;
  font-weight: 800;
}

.stat-value {
  max-width: 100%;
  font-size: clamp(20px, 4.6vw, 28px);
  line-height: 1.12;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.stat-emoji {
  position: absolute;
  right: 16px;
  bottom: 14px;
  font-size: 24px;
}

.bean-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rate-card {
  padding-bottom: $spacing-xl;
}

.section-title {
  margin-bottom: $spacing-md;
  font-size: 24px;
}

.rate-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.rate-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rate-header {
  @include flex-between;
  gap: $spacing-sm;
}

.rate-name {
  font-size: 15px;
  font-weight: 700;
}

.rate-value {
  font-size: 16px;
  font-weight: 800;
}

.rate-bar {
  width: 100%;
  height: 12px;
  background: rgba(226, 228, 231, 0.92);
  border-radius: $radius-full;
  overflow: hidden;
}

.rate-progress {
  height: 100%;
  border-radius: inherit;
  transition: width 0.45s ease;
}

.empty-state {
  text-align: center;
  color: $text-secondary;
  font-size: $font-md;
}
</style>
