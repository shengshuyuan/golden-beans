import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '../utils/storage'

// 奖励分类
export const REWARD_CATEGORIES = {
  FOOD: { name: '美食', icon: '🍔' },
  SHOPPING: { name: '购物', icon: '🛍️' },
  ENTERTAINMENT: { name: '娱乐', icon: '🎬' },
  EXPERIENCE: { name: '体验', icon: '🎯' },
  OTHER: { name: '其他', icon: '🎁' }
}

export const useRewardStore = defineStore('reward', () => {
  // 状态
  const rewards = ref([])
  const redeemRecords = ref([]) // 兑换记录

  // 初始化
  function init() {
    rewards.value = storage.get('rewards', [])
    redeemRecords.value = storage.get('redeemRecords', [])
  }

  // 可兑换的奖励
  const availableRewards = computed(() => {
    return rewards.value.filter(r => !r.archived)
  })

  // 添加奖励
  function addReward(reward) {
    const newReward = {
      id: Date.now().toString(),
      ...reward,
      createdAt: new Date().toISOString(),
      archived: false,
      redeemCount: 0
    }

    rewards.value.push(newReward)
    saveData()

    return newReward
  }

  // 更新奖励
  function updateReward(id, updates) {
    const index = rewards.value.findIndex(r => r.id === id)
    if (index !== -1) {
      rewards.value[index] = { ...rewards.value[index], ...updates }
      saveData()
    }
  }

  // 归档奖励
  function archiveReward(id) {
    updateReward(id, { archived: true })
  }

  // 删除奖励
  function deleteReward(id) {
    const index = rewards.value.findIndex(r => r.id === id)
    if (index !== -1) {
      rewards.value.splice(index, 1)
      saveData()
    }
  }

  // 兑换奖励
  function redeemReward(rewardId) {
    const reward = rewards.value.find(r => r.id === rewardId)
    if (!reward) {
      return { success: false, message: '奖励不存在' }
    }

    const userStore = useUserStore()

    // 使用 hasEnoughGold 检查余额
    if (!userStore.hasEnoughGold(reward.cost)) {
      return { success: false, message: '金豆不足', required: reward.cost, current: userStore.gold }
    }

    // 扣除金豆
    const deductResult = userStore.deductGold(reward.cost, `兑换奖励：${reward.name}`)

    // 二次验证扣除结果
    if (!deductResult.success) {
      return { success: false, message: '金豆扣除失败', ...deductResult }
    }

    // 记录兑换
    const record = {
      id: Date.now().toString(),
      rewardId: reward.id,
      rewardName: reward.name,
      cost: reward.cost,
      timestamp: new Date().toISOString()
    }

    redeemRecords.value.push(record)

    // 更新奖励兑换次数
    updateReward(reward.id, { redeemCount: (reward.redeemCount || 0) + 1 })

    saveData()

    return {
      success: true,
      reward,
      record
    }
  }

  // 获取兑换记录
  const recentRedeemRecords = computed(() => {
    return redeemRecords.value.slice(-20).reverse()
  })

  // 保存数据
  function saveData() {
    storage.set('rewards', rewards.value)
    storage.set('redeemRecords', redeemRecords.value)
  }

  return {
    rewards,
    redeemRecords,
    availableRewards,
    recentRedeemRecords,
    init,
    addReward,
    updateReward,
    archiveReward,
    deleteReward,
    redeemReward
  }
})

// 延迟导入避免循环依赖
import { useUserStore } from './user'
