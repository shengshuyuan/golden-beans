import { defineStore } from 'pinia'
import { LEDGER_ENTRY_TYPES, createLedgerEntry } from '../domain/goldRules'
import { appStorage } from '../repositories/appStorage'

export const useUserStore = defineStore('user', {
  state: () => {
    const s = appStorage.load()
    return {
      gold: s.user?.gold ?? 0,
      ledger: s.goldLedger || []
    }
  },

  actions: {
    hydrate() {
      const state = appStorage.load()
      this.gold = state.user?.gold ?? 0
      this.ledger = state.goldLedger || []
    },

    persist() {
      appStorage.patch(s => ({
        ...s,
        user: { ...s.user, gold: this.gold },
        goldLedger: this.ledger
      }))
    },

    addGold(amount, reason = '获得金豆', meta = {}, type = LEDGER_ENTRY_TYPES.CHECK_IN) {
      if (!amount || amount <= 0) return
      this.gold += amount
      this.ledger.unshift(createLedgerEntry({
        type,
        amount,
        balanceAfter: this.gold,
        reason,
        meta
      }))
      this.persist()
    },

    spendGold(amount, reason = '兑换奖励', meta = {}, type = LEDGER_ENTRY_TYPES.REDEEM) {
      if (amount <= 0) {
        return { success: false, message: '兑换数量不正确' }
      }

      if (this.gold < amount) {
        return { success: false, message: '金豆不够啦，先去完成几个习惯吧' }
      }

      this.gold -= amount
      this.ledger.unshift(createLedgerEntry({
        type,
        amount: -amount,
        balanceAfter: this.gold,
        reason,
        meta
      }))
      this.persist()
      return { success: true }
    },

    getStatistics() {
      const totalEarned = this.ledger
        .filter(item => item.amount > 0)
        .reduce((sum, item) => sum + item.amount, 0)
      const totalSpent = this.ledger
        .filter(item => item.amount < 0)
        .reduce((sum, item) => sum + Math.abs(item.amount), 0)

      return {
        totalEarned,
        totalSpent
      }
    }
  }
})
