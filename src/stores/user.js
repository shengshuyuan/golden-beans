import { defineStore } from 'pinia'
import { storage } from '../utils/storage'
import { LEDGER_ENTRY_TYPES, createLedgerEntry } from '../domain/goldRules'

export const useUserStore = defineStore('user', {
  state: () => ({
    gold: storage.get('user_gold', 0),
    ledger: storage.get('gold_ledger', [])
  }),

  actions: {
    hydrate() {
      this.gold = storage.get('user_gold', 0)
      this.ledger = storage.get('gold_ledger', [])
    },

    persist() {
      storage.set('user_gold', this.gold)
      storage.set('gold_ledger', this.ledger)
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
