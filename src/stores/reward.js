import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useAnalyticsStore } from './analytics'
import { LEDGER_ENTRY_TYPES } from '../domain/goldRules'
import { appStorage } from '../repositories/appStorage'

function sanitizeReward(reward) {
  return {
    id: reward.id,
    name: reward.name || '',
    description: reward.description || '',
    cost: Number(reward.cost) || 0,
    icon: reward.icon || '🎁',
    createdAt: reward.createdAt || new Date().toISOString(),
    updatedAt: reward.updatedAt || new Date().toISOString()
  }
}

export const useRewardStore = defineStore('reward', {
  state: () => {
    const s = appStorage.load()
    return {
      rewards: (s.rewards || []).map(sanitizeReward),
      redeemRecords: s.rewardRecords || []
    }
  },

  getters: {
    availableRewards: state => state.rewards
  },

  actions: {
    hydrate() {
      const state = appStorage.load()
      this.rewards = (state.rewards || []).map(sanitizeReward)
      this.redeemRecords = state.rewardRecords || []
    },

    persist() {
      appStorage.patch(s => ({
        ...s,
        rewards: this.rewards,
        rewardRecords: this.redeemRecords
      }))
    },

    getRewardById(id) {
      return this.rewards.find(item => item.id === id) || null
    },

    addReward(payload) {
      const reward = sanitizeReward({
        ...payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      this.rewards.unshift(reward)
      this.persist()
      const analytics = useAnalyticsStore()
      analytics.track('reward_created', { rewardId: reward.id, cost: reward.cost })
      return reward
    },

    updateReward(id, payload) {
      const index = this.rewards.findIndex(item => item.id === id)
      if (index === -1) return null
      this.rewards[index] = sanitizeReward({
        ...this.rewards[index],
        ...payload,
        id,
        updatedAt: new Date().toISOString()
      })
      this.persist()
      return this.rewards[index]
    },

    deleteReward(id) {
      this.rewards = this.rewards.filter(item => item.id !== id)
      this.persist()
    },

    redeemReward(id) {
      const reward = this.getRewardById(id)
      if (!reward) {
        return { success: false, message: '没有找到这个奖励' }
      }

      const userStore = useUserStore()
      const spendResult = userStore.spendGold(reward.cost, '兑换奖励', { rewardId: id }, LEDGER_ENTRY_TYPES.REDEEM)
      if (!spendResult.success) {
        return spendResult
      }

      this.redeemRecords.unshift({
        id: crypto.randomUUID(),
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost,
        createdAt: new Date().toISOString()
      })
      this.persist()

      const analytics = useAnalyticsStore()
      analytics.track('reward_redeemed', { rewardId: reward.id, cost: reward.cost })

      return {
        success: true,
        reward
      }
    }
  }
})
