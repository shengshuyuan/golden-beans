import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '../utils/storage'

export const useUserStore = defineStore('user', () => {
  // 状态
  const gold = ref(0)
  const goldRecords = ref([]) // 金豆流水记录
  const settings = ref({
    nickname: '',
    avatar: '',
    reminderEnabled: false
  })

  // 初始化
  function init() {
    gold.value = storage.get('gold', 0)
    goldRecords.value = storage.get('goldRecords', [])
    settings.value = storage.get('settings', {
      nickname: '',
      avatar: '',
      reminderEnabled: false
    })
  }

  // 金豆总额
  const totalGold = computed(() => gold.value)

  // 获取金豆流水
  const recentGoldRecords = computed(() => {
    return goldRecords.value.slice(-50).reverse()
  })

  // 添加金豆
  function addGold(amount, reason) {
    gold.value += amount

    goldRecords.value.push({
      id: Date.now().toString(),
      type: 'earn',
      amount,
      reason,
      balance: gold.value,
      timestamp: new Date().toISOString()
    })

    saveData()
  }

  // 检查金豆是否足够
  function hasEnoughGold(amount) {
    return gold.value >= amount
  }

  // 扣除金豆（金豆不足时会失败）
  function deductGold(amount, reason) {
    // 金豆不足时返回失败
    if (gold.value < amount) {
      return {
        success: false,
        required: amount,
        current: gold.value,
        short: amount - gold.value
      }
    }

    gold.value -= amount

    goldRecords.value.push({
      id: Date.now().toString(),
      type: 'deduct',
      amount: -amount,
      reason,
      balance: gold.value,
      timestamp: new Date().toISOString()
    })

    saveData()

    return {
      success: true,
      deducted: amount,
      balance: gold.value
    }
  }

  // 更新设置
  function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
    storage.set('settings', settings.value)
  }

  // 获取某月的金豆记录
  function getGoldRecordsByMonth(year, month) {
    return goldRecords.value.filter(record => {
      const date = new Date(record.timestamp)
      return date.getFullYear() === year && date.getMonth() === month
    })
  }

  // 获取统计数据
  function getStatistics() {
    const earnRecords = goldRecords.value.filter(r => r.type === 'earn')
    const deductRecords = goldRecords.value.filter(r => r.type === 'deduct')

    return {
      totalEarned: earnRecords.reduce((sum, r) => sum + r.amount, 0),
      totalDeducted: Math.abs(deductRecords.reduce((sum, r) => sum + r.amount, 0)),
      currentBalance: gold.value
    }
  }

  // 保存数据
  function saveData() {
    storage.set('gold', gold.value)
    storage.set('goldRecords', goldRecords.value)
  }

  return {
    gold,
    goldRecords,
    settings,
    totalGold,
    recentGoldRecords,
    init,
    addGold,
    deductGold,
    hasEnoughGold,
    updateSettings,
    getGoldRecordsByMonth,
    getStatistics
  }
})
