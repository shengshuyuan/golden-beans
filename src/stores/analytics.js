import { defineStore } from 'pinia'
import { appStorage } from '../repositories/appStorage'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => {
    const s = appStorage.load()
    return { events: s.analyticsEvents || [] }
  },

  actions: {
    hydrate() {
      const state = appStorage.load()
      this.events = state.analyticsEvents || []
    },

    track(eventType, data = {}) {
      this.events.push({
        type: eventType,
        data,
        ts: new Date().toISOString()
      })
      appStorage.patch(s => ({
        ...s,
        analyticsEvents: this.events
      }))
    },

    getInsights() {
      const now = new Date()
      const dayMs = 86400000

      // 首次使用是否创建习惯
      const firstHabitEvent = this.events.find(e => e.type === 'habit_created')
      const hasCreatedHabit = !!firstHabitEvent

      // 首次使用是否创建奖励
      const firstRewardEvent = this.events.find(e => e.type === 'reward_created')
      const hasCreatedReward = !!firstRewardEvent

      // 奖励是否被兑换过
      const hasRedeemed = this.events.some(e => e.type === 'reward_redeemed')

      // 7 日内打卡天数
      const sevenDaysAgo = new Date(now.getTime() - 7 * dayMs)
      const checkInDays = new Set()
      this.events
        .filter(e => e.type === 'check_in' && new Date(e.ts) >= sevenDaysAgo)
        .forEach(e => {
          const d = new Date(e.ts)
          checkInDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
        })

      // 连续使用天数（有打卡行为的天数）
      const allCheckInDays = new Set()
      this.events
        .filter(e => e.type === 'check_in')
        .forEach(e => {
          const d = new Date(e.ts)
          allCheckInDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
        })

      // 用户最常使用的习惯类型
      const typeCount = {}
      this.events
        .filter(e => e.type === 'check_in' && e.data?.habitType)
        .forEach(e => {
          typeCount[e.data.habitType] = (typeCount[e.data.habitType] || 0) + 1
        })
      const favoriteType = Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])
        .map(([type]) => type)[0] || null

      // 第一次打卡发生在创建后多久
      let firstCheckInDelay = null
      if (firstHabitEvent) {
        const firstCheckIn = this.events.find(e => e.type === 'check_in')
        if (firstCheckIn) {
          firstCheckInDelay = Math.round(
            (new Date(firstCheckIn.ts) - new Date(firstHabitEvent.ts)) / 60000
          )
        }
      }

      return {
        hasCreatedHabit,
        hasCreatedReward,
        hasRedeemed,
        activeDays7d: checkInDays.size,
        totalActiveDays: allCheckInDays.size,
        favoriteType,
        firstCheckInDelay
      }
    }
  }
})
