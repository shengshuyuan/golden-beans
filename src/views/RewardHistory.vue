<script setup>
import { computed } from 'vue'
import { useRewardStore } from '../stores/reward'
import GoldBeanIcon from '../components/common/GoldBeanIcon.vue'

const rewardStore = useRewardStore()

const groupedRecords = computed(() => {
  const groups = {}
  rewardStore.redeemRecords.forEach(item => {
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

const totalSpent = computed(() =>
  rewardStore.redeemRecords.reduce((sum, item) => sum + item.cost, 0)
)

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="history-page page-shell">
    <header class="page-header">
      <h1 class="page-title">兑换记录</h1>
      <div class="summary-strip">
        <div class="summary-item">
          <span class="summary-label">兑换次数</span>
          <strong class="summary-value">{{ rewardStore.redeemRecords.length }}</strong>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-label">累计消耗</span>
          <strong class="summary-value spent">{{ totalSpent }}</strong>
        </div>
      </div>
    </header>

    <section v-if="Object.keys(groupedRecords).length === 0" class="glass-panel empty-state">
      <div class="empty-icon">📋</div>
      <h2 class="empty-title">还没有兑换记录</h2>
      <p class="empty-text">去奖励中心兑换想要的奖励吧！</p>
    </section>

    <section v-else class="records-list">
      <div v-for="(items, date) in groupedRecords" :key="date" class="record-group">
        <h3 class="group-date">{{ date }}</h3>
        <div class="glass-panel group-card">
          <article v-for="item in items" :key="item.id" class="record-item">
            <div class="item-left">
              <span class="item-icon">🎁</span>
              <div class="item-info">
                <span class="item-name">{{ item.rewardName }}</span>
                <span class="item-time">{{ formatTime(item.createdAt) }}</span>
              </div>
            </div>
            <span class="item-cost">
              <GoldBeanIcon :size="16" />
              <span>-{{ item.cost }}</span>
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

.history-page {
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

.summary-value.spent {
  color: $primary-brown;
}

.summary-divider {
  width: 1px;
  height: 32px;
  background: rgba(0, 0, 0, 0.08);
}

.records-list {
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

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
}

.record-item + .record-item {
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
  background: rgba(255, 180, 74, 0.15);
  font-size: 18px;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-name {
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

.item-cost {
  display: flex;
  align-items: center;
  gap: 4px;
  color: $primary-brown;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
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
