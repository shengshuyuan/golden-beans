<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useUiStore } from '../stores/ui'
import { appStorage } from '../repositories/appStorage'
import BaseModal from '../components/common/BaseModal.vue'
import GoldBeanIcon from '../components/common/GoldBeanIcon.vue'
import EmptyState from '../components/common/EmptyState.vue'

const userStore = useUserStore()
const uiStore = useUiStore()

// 筛选状态
const activeFilter = ref('all')
const showImportModal = ref(false)
const showImportConfirm = ref(false)
const showRestoreConfirm = ref(false)
const importPreview = ref(null)

// 备份和存储健康
const backupInfo = computed(() => appStorage.getBackupInfo())
const storageHealth = computed(() => appStorage.checkHealth())

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

function handleExport() {
  const json = appStorage.exportJson()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const today = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `golden-bean-backup-${today}.json`
  a.click()
  URL.revokeObjectURL(url)
  uiStore.showToast('备份文件已下载', 'success')
}

function handleImportClick() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const state = data.state || data
      const habits = state.habits || []
      const records = state.checkRecords || {}
      const rewards = state.rewards || []
      const ledger = state.goldLedger || []
      const totalGold = state.user?.gold ?? 0

      importPreview.value = {
        json: text,
        fileName: file.name,
        habitCount: habits.length,
        recordCount: Object.values(records).reduce((sum, r) => sum + Object.keys(r).length, 0),
        rewardCount: rewards.length,
        ledgerCount: ledger.length,
        totalGold
      }
      showImportModal.value = true
    } catch {
      uiStore.showToast('无法读取文件，请确认是金豆备份文件', 'error')
    }
  }
  input.click()
}

function confirmImport() {
  showImportModal.value = false
  showImportConfirm.value = true
}

function executeImport() {
  if (!importPreview.value) return
  const result = appStorage.importJson(importPreview.value.json)
  showImportConfirm.value = false

  if (result.success) {
    userStore.hydrate()
    uiStore.showToast('数据恢复成功，页面将刷新', 'success')
    setTimeout(() => location.reload(), 800)
  } else {
    uiStore.showToast(result.error || '导入失败', 'error')
  }
  importPreview.value = null
}

function confirmRestore() {
  showRestoreConfirm.value = true
}

function executeRestore() {
  showRestoreConfirm.value = false
  const result = appStorage.restoreFromBackup()
  if (result.success) {
    userStore.hydrate()
    uiStore.showToast('已从自动备份恢复，页面将刷新', 'success')
    setTimeout(() => location.reload(), 800)
  } else {
    uiStore.showToast(result.error || '恢复失败', 'error')
  }
}

function formatBackupTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} 小时前`
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="ledger-page page-shell">
    <header class="page-header">
      <div class="header-row">
        <h1 class="page-title">金豆明细</h1>
        <div class="header-actions">
          <button class="icon-btn" aria-label="导出备份" @click="handleExport">↓</button>
          <button class="icon-btn" aria-label="导入备份" @click="handleImportClick">↑</button>
        </div>
      </div>
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

      <!-- 存储状态（仅临界时在此页也提示） -->
      <div v-if="storageHealth.critical" class="storage-warning critical">
        <span>⚠️ 存储空间即将用尽（{{ storageHealth.usage }}%），建议导出备份</span>
      </div>
    </header>

    <EmptyState
      v-if="Object.keys(groupedLedger).length === 0"
      icon="📒"
      title="还没有金豆记录"
      text="完成习惯打卡后，金豆变动会显示在这里。"
    />

    <section v-else class="ledger-list">
      <div v-for="(items, date) in groupedLedger" :key="date" class="ledger-group">
        <h3 class="group-date">{{ date }}</h3>
        <div class="glass-panel group-card">
          <article v-for="item in items" :key="item.id" class="ledger-item">
            <div class="item-left">
              <span class="item-icon" :class="{ income: item.amount > 0, expense: item.amount < 0 }">
                <GoldBeanIcon v-if="item.amount > 0" :size="18" />
                <span v-else class="icon-minus">−</span>
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

    <!-- 导入预览 -->
    <BaseModal v-if="showImportModal" max-width="360px" @close="showImportModal = false">
      <div class="import-preview">
        <h3 class="import-title">导入备份</h3>
        <p class="import-file">文件：{{ importPreview?.fileName }}</p>
        <div class="import-stats">
          <div class="import-stat">
            <span class="stat-label">习惯</span>
            <strong>{{ importPreview?.habitCount }} 个</strong>
          </div>
          <div class="import-stat">
            <span class="stat-label">打卡记录</span>
            <strong>{{ importPreview?.recordCount }} 条</strong>
          </div>
          <div class="import-stat">
            <span class="stat-label">奖励</span>
            <strong>{{ importPreview?.rewardCount }} 个</strong>
          </div>
          <div class="import-stat">
            <span class="stat-label">金豆明细</span>
            <strong>{{ importPreview?.ledgerCount }} 条</strong>
          </div>
          <div class="import-stat">
            <span class="stat-label">金豆余额</span>
            <strong>{{ importPreview?.totalGold }}</strong>
          </div>
        </div>
        <div class="import-actions">
          <button class="ghost-btn" @click="showImportModal = false">取消</button>
          <button class="primary-btn" @click="confirmImport">确认导入</button>
        </div>
      </div>
    </BaseModal>

    <!-- 二次确认 -->
    <BaseModal v-if="showImportConfirm" max-width="340px" @close="showImportConfirm = false">
      <div class="import-confirm">
        <h3 class="confirm-title">⚠️ 确认覆盖</h3>
        <p class="confirm-text">导入会覆盖当前所有本地数据，此操作不可撤销。建议先导出当前数据备份。</p>
        <div class="import-actions">
          <button class="ghost-btn" @click="showImportConfirm = false">取消</button>
          <button class="danger-btn" @click="executeImport">确认覆盖</button>
        </div>
      </div>
    </BaseModal>

    <!-- 数据管理 -->
    <section class="glass-panel data-manage">
      <h3 class="manage-title">数据管理</h3>
      <div class="manage-row">
        <div class="manage-info">
          <span class="manage-label">自动备份</span>
          <span v-if="backupInfo.exists" class="manage-value safe">{{ formatBackupTime(backupInfo.savedAt) }}</span>
          <span v-else class="manage-value">暂无备份</span>
        </div>
        <button v-if="backupInfo.exists" class="ghost-btn small" @click="confirmRestore">恢复</button>
      </div>
      <p class="manage-hint">每次操作自动备份，导入前也会自动备份，防止数据丢失。</p>
    </section>

    <!-- 恢复确认 -->
    <BaseModal v-if="showRestoreConfirm" max-width="340px" @close="showRestoreConfirm = false">
      <div class="import-confirm">
        <h3 class="confirm-title">恢复自动备份</h3>
        <p class="confirm-text">将用最近一次自动备份覆盖当前数据。当前数据会先备份，不用担心丢失。</p>
        <div class="import-actions">
          <button class="ghost-btn" @click="showRestoreConfirm = false">取消</button>
          <button class="primary-btn" @click="executeRestore">确认恢复</button>
        </div>
      </div>
    </BaseModal>
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

.header-row {
  @include flex-between;
}

.page-title {
  font-size: 28px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  color: $text-secondary;
  font-size: 18px;
  font-weight: 800;
  box-shadow: $shadow-sm;
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
  color: $success-color;
}

.summary-value.spent {
  color: $danger-color;
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
  background: $success-soft;
  color: $success-color;
}

.item-icon.expense {
  background: $danger-soft;
  color: $danger-color;
}

.icon-minus {
  font-size: 16px;
  font-weight: 900;
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
  color: $success-color;
}

.item-amount.expense {
  color: $danger-color;
}

/* 导入弹窗 */
.import-preview,
.import-confirm {
  text-align: center;
}

.import-title,
.confirm-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 8px;
}

.import-file {
  color: $text-secondary;
  font-size: 13px;
  margin: 0 0 16px;
}

.confirm-text {
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px;
}

.import-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.import-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px;
  border-radius: 14px;
  background: #fbf6ef;

  .stat-label {
    font-size: 11px;
    color: $text-secondary;
    font-weight: 700;
  }

  strong {
    font-size: 15px;
    font-weight: 900;
    color: $primary-deep;
  }
}

.import-actions {
  display: flex;
  gap: 10px;
}

.ghost-btn {
  flex: 1;
  min-height: 44px;
  border-radius: 16px;
  background: #f5f0e8;
  color: $text-secondary;
  font-size: 14px;
  font-weight: 700;
}

.primary-btn {
  @include button-primary;
  flex: 1;
}

.danger-btn {
  flex: 1;
  min-height: 44px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff3b30 100%);
  color: white;
  font-size: 14px;
  font-weight: 700;
}

/* 存储状态 */
.storage-warning {
  padding: 8px 14px;
  border-radius: 12px;
  background: rgba(255, 159, 10, 0.1);
  font-size: 12px;
  font-weight: 600;
  color: #cc7a00;
}

.storage-warning.critical {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

/* 数据管理 */
.data-manage {
  padding: 16px;
}

.manage-title {
  font-size: 14px;
  font-weight: 800;
  color: $text-primary;
  margin: 0 0 12px;
}

.manage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.manage-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.manage-label {
  font-size: 12px;
  color: $text-secondary;
  font-weight: 700;
}

.manage-value {
  font-size: 13px;
  font-weight: 700;
  color: $text-primary;
}

.manage-value.safe {
  color: $success-color;
}

.manage-hint {
  margin-top: 10px;
  font-size: 11px;
  color: $text-light;
  line-height: 1.5;
}

.ghost-btn.small {
  min-height: 32px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 12px;
  flex: 0;
}
</style>
