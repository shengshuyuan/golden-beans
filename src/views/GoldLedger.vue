<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/user'
import GoldBeanIcon from '../components/common/GoldBeanIcon.vue'

const userStore = useUserStore()

// 筛选状态
const activeFilter = ref('all')

// 筛选后的记录
const filteredLedger = computed(() => {
  if (activeFilter.value === 'all') return userStore.ledger
  if (activeFilter.value === 'income') return userStore.ledger.filter(item => item.amount > 0)
  if (activeFilter.value === 'expense') return userStore.ledger.filter(item => item.amount < 0)
  return userStore.ledger
})

const groupedLedger = computed(() => {
  const groups = {}
  filteredLedger.value.forEach(item => {
    const date = new Date(item.createdAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })
  return groups
})

const statistics = computed(() => userStore.getStatistics())
const totalEarned = computed(() => statistics.value.totalEarned)
const totalSpent = computed(() => statistics.value.totalSpent)

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="ledger-page page-shell">
    <header class="page-header">
      <h1 class="page-title">金豆明细</h1>
      <div class="summary-strip">
        <div class="summary-item">
          <span class="summary-label">当前余额</span>
          <strong class="summary-value">{{ userStore.gold }}</strong>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-label">累计收入</span>
          <strong class="summary-value earned">+{{ totalEarned }}</strong>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-label">累计支出</span>
          <strong class="summary-value spent">-{{ totalSpent }}</strong>
        </div>
      </div>
      <div class="filter-strip">
        <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">全部</button>
        <button class="filter-btn" :class="{ active: activeFilter === 'income' }" @click="activeFilter = 'income'">收入</button>
        <button class="filter-btn" :class="{ active: activeFilter === 'expense' }" @click="activeFilter = 'expense'">支出</button>
      </div>
    </header>

    <section v-if="Object.keys(groupedLedger).length === 0" class="glass-panel empty-state">
      <div class="empty-icon">📒</div>
      <h2 class="empty-title">还没有金豆记录</h2>
      <p class="empty-text">完成习惯打卡后，金豆变动会显示在这里。</p>
    </section>

    <section v-else class="ledger-list">
      <div v-for="(items, date) in groupedLedger" :key="date" class="ledger-group">
        <h3 class="group-date">{{ date }}</h3>
        <div class="glass-panel group-card">
          <article v-for="item in items" :key="item.id" class="ledger-item">
            <div class="item-left">
              <span class="item-icon" :class="{ income: item.amount > 0, expense: item.amount < 0 }">
                {{ item.amount > 0 ? '+' : '-' }}
              </span>
              <div class="item-info">
                <span class="item-reason">{{ item.reason }}</span>
                <span class="item-time">{{ formatTime(item.createdAt) }}</span>
              </div>
            </div>
            <span class="item-amount" :class="{ income: item.amount > 0, expense: item.amount < 0 }">
              {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
            </span>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.ledger-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page-title {
  font-size: 28px;
}

.summary-strip {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px 12px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: $shadow-sm;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.summary-label {
  color: $text-secondary;
  font-size: 12px;
  font-weight: 700;
}

.summary-value {
  font-size: 20px;
  font-weight: 900;
  color: $text-primary;
}

.summary-value.earned {
  color: #34c759;
}

.summary-value.spent {
  color: #ff3b30;
}

.summary-divider {
  width: 1px;
  height: 32px;
  background: rgba(0, 0, 0, 0.08);
}

.filter-strip {
  display: flex;
  gap: 8px;
  padding: 6px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: $shadow-sm;
}

.filter-btn {
  flex: 1;
  min-height: 36px;
  border-radius: 16px;
  color: $text-secondary;
  font-size: 13px;
  font-weight: 700;
}

.filter-btn.active {
  background: linear-gradient(135deg, #ffbf61 0%, #ff922f 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 146, 47, 0.3);
}

.ledger-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-date {
  margin-bottom: 8px;
  color: $text-secondary;
  font-size: 13px;
  font-weight: 700;
}

.group-card {
  padding: 4px 16px;
}

.ledger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
}

.ledger-item + .ledger-item {
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  font-size: 16px;
  flex-shrink: 0;
}

.item-icon.income {
  background: rgba(52, 199, 89, 0.12);
  color: #34c759;
}

.item-icon.expense {
  background: rgba(255, 59, 48, 0.12);
  color: #ff3b30;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-reason {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  color: $text-light;
  font-size: 12px;
}

.item-amount {
  font-size: 16px;
  font-weight: 900;
  flex-shrink: 0;
}

.item-amount.income {
  color: #34c759;
}

.item-amount.expense {
  color: #ff3b30;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 40px;
}

.empty-title {
  margin-top: 14px;
  font-size: 18px;
}

.empty-text {
  margin-top: 10px;
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.6;
}
</style>
