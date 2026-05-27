<script setup>
import { computed, ref } from 'vue'
import { HABIT_TYPE_CONFIG, useHabitStore } from '../stores/habit'
import { useUserStore } from '../stores/user'
import { getCalendarData, getTodayString } from '../utils/date'
import { calculateCompletionRate, generateInsights, getDayStatus as getDayStatusUtil } from '../domain/statsUtils'
import GoldBeanIcon from '../components/common/GoldBeanIcon.vue'

const habitStore = useHabitStore()
const userStore = useUserStore()

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']
const currentDate = ref(new Date())
const ratePeriod = ref('month')
const today = getTodayString()

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthLabel = computed(() => `${currentYear.value}年${currentMonth.value + 1}月`)
const calendarData = computed(() => getCalendarData(currentYear.value, currentMonth.value))

const statistics = computed(() => {
  const userStats = userStore.getStatistics()
  const activeHabits = habitStore.activeHabits
  let totalChecks = 0
  let currentStreak = 0
  let longestStreak = 0

  activeHabits.forEach(habit => {
    const records = habitStore.getRecordsByHabit(habit.id)
    totalChecks += Object.values(records).filter(record => record.checked).length
    currentStreak = Math.max(currentStreak, habitStore.getStreakDays(habit.id))
    longestStreak = Math.max(longestStreak, habitStore.getLongestStreak(habit.id))
  })

  return {
    totalChecks,
    currentStreak,
    longestStreak,
    totalGold: userStats.totalEarned || userStore.gold
  }
})

const habitStats = computed(() =>
  habitStore.activeHabits.map(habit => {
    const records = habitStore.getRecordsByHabit(habit.id)
    const checkedDays = Object.values(records).filter(item => item.checked).length
    return {
      ...habit,
      rate: calculateCompletionRate(checkedDays, habit.createdAt),
      streak: habitStore.getStreakDays(habit.id)
    }
  })
)

const monthCompletion = computed(() => {
  const days = calendarData.value.filter(day => day.isCurrentMonth)
  const completed = days.filter(day => getDayStatus(day.date) === 'all').length
  return {
    completed,
    total: days.length
  }
})

function getDayStatus(date) {
  return getDayStatusUtil(date, habitStore.activeHabits, (hid, d) => habitStore.getCheckRecord(hid, d))
}

function dayClass(day) {
  return {
    other: !day.isCurrentMonth,
    today: day.date === today,
    done: getDayStatus(day.date) === 'all',
    partial: getDayStatus(day.date) === 'partial'
  }
}

const insights = computed(() => generateInsights(habitStats.value))

// 金豆趋势图（最近 14 天每天收入）
const goldTrend = computed(() => {
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    const dayStart = new Date(ds + 'T00:00:00').getTime()
    const dayEnd = dayStart + 86400000
    const income = userStore.ledger
      .filter(e => e.amount > 0 && new Date(e.createdAt).getTime() >= dayStart && new Date(e.createdAt).getTime() < dayEnd)
      .reduce((s, e) => s + e.amount, 0)
    days.push({ date: ds, day: d.getDate(), income })
  }
  return days
})

const goldTrendMax = computed(() => Math.max(1, ...goldTrend.value.map(d => d.income)))

const goldTrendPath = computed(() => {
  const w = 280
  const h = 60
  const pad = 4
  const pts = goldTrend.value.map((d, i) => {
    const x = pad + (i / (goldTrend.value.length - 1)) * (w - pad * 2)
    const y = h - pad - (d.income / goldTrendMax.value) * (h - pad * 2)
    return `${x},${y}`
  })
  return `M${pts.join(' L')}`
})

const goldTrendFillPath = computed(() => {
  const w = 280
  const h = 60
  const pad = 4
  const pts = goldTrend.value.map((d, i) => {
    const x = pad + (i / (goldTrend.value.length - 1)) * (w - pad * 2)
    const y = h - pad - (d.income / goldTrendMax.value) * (h - pad * 2)
    return `${x},${y}`
  })
  return `M${pad},${h} L${pts.join(' L')} L${w - pad},${h} Z`
})

// 周/月完成率
const weekCompletion = computed(() => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)
  let completed = 0
  let total = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    if (d > now) break
    const ds = getTodayString(d)
    habitStore.activeHabits.forEach(() => { total++ })
    completed += habitStore.getCompletedHabitsByDate(ds).length
  }
  return { completed, total }
})
</script>

<template>
  <div class="stats-page page-shell">
    <header class="page-header">
      <h1 class="page-title">我的数据</h1>
      <div class="month-switcher">
        <button class="month-btn" @click="currentDate = new Date(currentYear, currentMonth - 1, 1)">‹</button>
        <span class="month-title">{{ currentMonthLabel }}</span>
        <button class="month-btn" @click="currentDate = new Date(currentYear, currentMonth + 1, 1)">›</button>
      </div>
    </header>

    <section class="glass-panel calendar-card">
      <div class="weekday-row">
        <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
      </div>

      <div class="calendar-grid">
        <div v-for="(day, index) in calendarData" :key="index" class="calendar-day" :class="dayClass(day)">
          <span class="day-number">{{ day.day }}</span>
          <span v-if="getDayStatus(day.date) !== 'none'" class="day-dot"></span>
        </div>
      </div>

      <div class="calendar-footer">本月完成 {{ monthCompletion.completed }}/{{ monthCompletion.total }} 天</div>
    </section>

    <section class="stats-grid">
      <article class="glass-panel stat-card">
        <div class="stat-title">总打卡次数</div>
        <div class="stat-value">{{ statistics.totalChecks }}次</div>
        <div class="stat-emoji">🗓️</div>
      </article>
      <article class="glass-panel stat-card">
        <div class="stat-title">最长连续</div>
        <div class="stat-value">{{ statistics.longestStreak }}天</div>
        <div class="stat-emoji">🏆</div>
      </article>
      <article class="glass-panel stat-card">
        <div class="stat-title">当前连续</div>
        <div class="stat-value">{{ statistics.currentStreak }}天</div>
        <div class="stat-emoji">🔥</div>
      </article>
      <article class="glass-panel stat-card">
        <div class="stat-title">累计金豆</div>
        <div class="stat-value bean-value">{{ statistics.totalGold }}颗</div>
        <div class="stat-emoji bean-emoji"><GoldBeanIcon :size="28" /></div>
      </article>
      <article class="glass-panel stat-card">
        <div class="stat-title">总消费金豆</div>
        <div class="stat-value spent-value">{{ userStore.getStatistics().totalSpent }}颗</div>
        <div class="stat-emoji">🛒</div>
      </article>
    </section>

    <!-- 金豆趋势 -->
    <section class="glass-panel trend-card">
      <h2 class="section-title">金豆趋势 <span class="trend-sub">近 14 天</span></h2>
      <svg class="trend-svg" viewBox="0 0 280 60" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffc664" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#ffc664" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path :d="goldTrendFillPath" fill="url(#trendFill)" />
        <path :d="goldTrendPath" fill="none" stroke="#ff9b31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <div class="trend-labels">
        <span v-for="(d, i) in goldTrend" :key="d.date" class="trend-label" :class="{ show: i % 3 === 0 || i === goldTrend.length - 1 }">
          {{ d.day }}日
        </span>
      </div>
    </section>

    <section class="glass-panel rate-card">
      <div class="rate-header-bar">
        <h2 class="section-title">习惯完成率</h2>
        <div class="rate-toggle">
          <button class="toggle-btn" :class="{ active: ratePeriod === 'week' }" @click="ratePeriod = 'week'">本周</button>
          <button class="toggle-btn" :class="{ active: ratePeriod === 'month' }" @click="ratePeriod = 'month'">本月</button>
        </div>
      </div>

      <div class="rate-summary">
        <span v-if="ratePeriod === 'week'">{{ weekCompletion.completed }}/{{ weekCompletion.total }}</span>
        <span v-else>{{ monthCompletion.completed }}/{{ monthCompletion.total }}</span>
        <span class="rate-summary-label">{{ ratePeriod === 'week' ? '本周完成' : '本月完成' }}</span>
      </div>

      <div v-if="habitStats.length === 0" class="empty-state">还没有习惯数据</div>

      <div v-else class="rate-list">
        <article v-for="habit in habitStats" :key="habit.id" class="rate-item">
          <div class="rate-header">
            <span class="rate-name">{{ habit.icon || HABIT_TYPE_CONFIG[habit.type]?.icon }} {{ habit.name }}</span>
            <span class="rate-value">{{ habit.rate }}%</span>
          </div>
          <div class="rate-bar">
            <div class="rate-progress" :style="{ width: `${habit.rate}%`, backgroundColor: HABIT_TYPE_CONFIG[habit.type]?.color }"></div>
          </div>
        </article>
      </div>
    </section>

    <!-- 产品洞察 -->
    <section v-if="insights.length > 0" class="glass-panel insights-card">
      <h2 class="section-title">洞察与建议</h2>
      <div class="insight-list">
        <article v-for="(item, index) in insights" :key="index" class="insight-item">
          <span class="insight-icon">{{ item.icon }}</span>
          <div>
            <p class="insight-title">{{ item.title }}</p>
            <p class="insight-text">{{ item.text }}</p>
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
  gap: 18px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  font-size: 28px;
}

.month-switcher {
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
}

.month-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e5e9f0;
  color: $text-primary;
}

.month-title {
  font-size: 14px;
  font-weight: 800;
}

.calendar-card,
.rate-card {
  padding: 16px;
}

.weekday-row,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.weekday-row {
  color: $text-light;
  font-size: 12px;
  text-align: center;
}

.calendar-grid {
  margin-top: 10px;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  aspect-ratio: 1;
  border-radius: 16px;
  background: #f5f7fa;
}

.calendar-day.other {
  opacity: 0.38;
}

.calendar-day.today {
  box-shadow: inset 0 0 0 2px rgba(32, 199, 163, 0.5);
}

.calendar-day.done {
  background: linear-gradient(180deg, #d4ede5, #a8dfc8);
}

.calendar-day.partial {
  background: linear-gradient(180deg, #e8f4ef, #d0eadc);
}

.day-number {
  font-size: 13px;
  font-weight: 700;
}

.day-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #20c7a3;
}

.calendar-footer {
  margin-top: 12px;
  color: $text-secondary;
  font-size: 13px;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  position: relative;
  min-height: 130px;
  padding: 16px;
  background: linear-gradient(180deg, #f5f7fa, #edf0f5);
}

.stat-title {
  color: $text-secondary;
  font-size: 13px;
  font-weight: 700;
}

.stat-value {
  margin-top: 12px;
  max-width: calc(100% - 42px);
  color: $text-primary;
  font-size: clamp(24px, 6vw, 32px);
  line-height: 1.08;
  font-weight: 900;
  word-break: break-word;
}

.stat-emoji {
  position: absolute;
  right: 14px;
  bottom: 12px;
  font-size: 28px;
}

.bean-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spent-value {
  color: #ff6b6b;
}

/* 金豆趋势 */
.trend-card {
  padding: 16px;
}

.trend-sub {
  font-size: 12px;
  color: $text-light;
  font-weight: 600;
  margin-left: 6px;
}

.trend-svg {
  width: 100%;
  height: 60px;
  margin-top: 10px;
}

.trend-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.trend-label {
  font-size: 10px;
  color: $text-light;
  visibility: hidden;
}

.trend-label.show {
  visibility: visible;
}

/* 完成率切换 */
.rate-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.rate-toggle {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 14px;
  background: #f0ebe3;
}

.toggle-btn {
  min-height: 28px;
  padding: 0 12px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  color: $text-secondary;
}

.toggle-btn.active {
  background: white;
  color: $text-primary;
  box-shadow: $shadow-sm;
}

.rate-summary {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 12px 0 4px;

  span:first-child {
    font-size: 22px;
    font-weight: 900;
    color: $primary-deep;
  }
}

.rate-summary-label {
  font-size: 12px;
  color: $text-secondary;
  font-weight: 700;
}

.section-title {
  font-size: 18px;
}

.rate-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.rate-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.rate-name {
  min-width: 0;
  font-size: 14px;
  font-weight: 800;
}

.rate-value {
  color: #5a6b80;
  font-size: 14px;
  font-weight: 900;
}

.rate-bar {
  height: 9px;
  border-radius: $radius-full;
  background: #e5e9f0;
  overflow: hidden;
}

.rate-progress {
  height: 100%;
  border-radius: inherit;
}

.empty-state {
  padding: 18px 0 4px;
  color: $text-secondary;
  font-size: 14px;
  text-align: center;
}

/* 洞察与建议 */
.insights-card {
  padding: 18px 16px;
}

.insight-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background: #f8f3ec;
}

.insight-icon {
  font-size: 22px;
  flex-shrink: 0;
  margin-top: 2px;
}

.insight-title {
  font-size: 14px;
  font-weight: 800;
  color: $text-primary;
  margin: 0;
}

.insight-text {
  font-size: 13px;
  color: $text-secondary;
  margin: 4px 0 0;
  line-height: 1.5;
}
</style>
