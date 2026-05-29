<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

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
</script>

<template>
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
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.trend-card {
  padding: 16px;
}

.section-title {
  font-size: 18px;
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
</style>
