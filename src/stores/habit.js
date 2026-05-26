import { defineStore } from 'pinia'
import { storage } from '../utils/storage'
import { getTodayString, shiftDate } from '../utils/date'
import { useUserStore } from './user'
import {
  HABIT_TYPE_CONFIG,
  HABIT_ICON_OPTIONS,
  getMilestoneBonus,
  getStreakTierName,
  getStreakBreakPenalty
} from '../config/habitConstants'

// Re-export for backward compatibility
export { HABIT_TYPE_CONFIG, STREAK_REWARD_TIERS, HABIT_ICON_OPTIONS, getMilestoneBonus, getStreakTierName } from '../config/habitConstants'

function sanitizeHabit(habit) {
  return {
    id: habit.id,
    name: habit.name || '',
    description: habit.description || '',
    type: habit.type || 'easy',
    icon: HABIT_ICON_OPTIONS.includes(habit.icon) ? habit.icon : '',
    archived: Boolean(habit.archived),
    createdAt: habit.createdAt || new Date().toISOString(),
    updatedAt: habit.updatedAt || new Date().toISOString()
  }
}

export const useHabitStore = defineStore('habit', {
  state: () => ({
    habits: storage.get('habits', []).map(sanitizeHabit),
    checkRecords: storage.get('check_records', {})
  }),

  getters: {
    activeHabits: state => state.habits.filter(h => !h.archived),

    getRecordsByHabit: state => habitId => state.checkRecords[habitId] || {}
  },

  actions: {
    hydrate() {
      this.habits = storage.get('habits', []).map(sanitizeHabit)
      this.checkRecords = storage.get('check_records', {})
    },

    persist() {
      storage.set('habits', this.habits)
      storage.set('check_records', this.checkRecords)
    },

    getHabitById(id) {
      return this.habits.find(item => item.id === id) || null
    },

    addHabit(payload) {
      const habit = sanitizeHabit({
        ...payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      this.habits.unshift(habit)
      this.persist()
      return habit
    },

    updateHabit(id, payload) {
      const index = this.habits.findIndex(item => item.id === id)
      if (index === -1) return null
      this.habits[index] = sanitizeHabit({
        ...this.habits[index],
        ...payload,
        id,
        updatedAt: new Date().toISOString()
      })
      this.persist()
      return this.habits[index]
    },

    deleteHabit(id) {
      this.habits = this.habits.filter(item => item.id !== id)
      delete this.checkRecords[id]
      this.persist()
    },

    archiveHabit(id) {
      this.updateHabit(id, { archived: true })
    },

    restoreHabit(id) {
      this.updateHabit(id, { archived: false })
    },

    getCheckRecord(habitId, date = getTodayString()) {
      return this.checkRecords[habitId]?.[date] || {
        checked: false,
        isMakeup: false,
        checkedAt: ''
      }
    },

    setCheckRecord(habitId, date, value) {
      if (!this.checkRecords[habitId]) {
        this.checkRecords[habitId] = {}
      }
      this.checkRecords[habitId][date] = value
    },

    getStreakDays(habitId, anchorDate = getTodayString()) {
      let cursor = new Date(anchorDate)
      let currentDate = getTodayString(cursor)

      if (!this.getCheckRecord(habitId, currentDate).checked) {
        cursor = shiftDate(cursor, -1)
        currentDate = getTodayString(cursor)
      }

      let streak = 0
      for (let index = 0; index < 3650; index += 1) {
        const record = this.getCheckRecord(habitId, currentDate)
        if (!record.checked) break
        streak += 1
        cursor = shiftDate(cursor, -1)
        currentDate = getTodayString(cursor)
      }
      return streak
    },

    getLongestStreak(habitId) {
      const records = this.checkRecords[habitId] || {}
      const checkedDates = Object.entries(records)
        .filter(([, record]) => record.checked)
        .map(([date]) => date)
        .sort()

      if (checkedDates.length === 0) return 0

      let best = 1
      let current = 1

      for (let index = 1; index < checkedDates.length; index += 1) {
        const prevDate = new Date(checkedDates[index - 1])
        const nextDate = new Date(checkedDates[index])
        const diff = Math.round((nextDate - prevDate) / 86400000)
        if (diff === 1) {
          current += 1
          best = Math.max(best, current)
        } else if (diff > 1) {
          current = 1
        }
      }

      return best
    },

    getCompletedHabitsByDate(date = getTodayString()) {
      return this.activeHabits.filter(habit => this.getCheckRecord(habit.id, date).checked)
    },

    getPendingHabitsByDate(date = getTodayString()) {
      return this.activeHabits.filter(habit => !this.getCheckRecord(habit.id, date).checked)
    },

    canMakeup(habitId) {
      const yesterday = getTodayString(shiftDate(new Date(), -1))
      return !this.getCheckRecord(habitId, yesterday).checked
    },

    checkIn(habitId, date = getTodayString()) {
      const habit = this.getHabitById(habitId)
      if (!habit) {
        return { success: false, message: '没有找到这项习惯' }
      }

      const record = this.getCheckRecord(habitId, date)
      if (record.checked) {
        return { success: false, message: '今天已经打过卡了' }
      }

      // 先检查并应用断签惩罚
      const penaltyResult = this.checkAndApplyStreakBreak(habitId, date)

      this.setCheckRecord(habitId, date, {
        checked: true,
        isMakeup: false,
        checkedAt: new Date().toISOString()
      })

      const typeConfig = HABIT_TYPE_CONFIG[habit.type] || HABIT_TYPE_CONFIG.easy
      const newStreak = this.getStreakDays(habitId, date)
      const prevStreak = newStreak - 1
      const streakBonus = getMilestoneBonus(newStreak, prevStreak)
      const allClearBonus = this.getPendingHabitsByDate(date).length === 0 ? 3 : 0
      const totalGold = typeConfig.gold + streakBonus + allClearBonus

      const userStore = useUserStore()
      userStore.addGold(totalGold, '完成习惯', {
        habitId,
        date,
        streakBonus,
        allClearBonus
      })

      this.persist()

      return {
        success: true,
        habit,
        totalGold,
        baseGold: typeConfig.gold,
        streakBonus,
        allClearBonus,
        newStreak,
        streakTierName: getStreakTierName(newStreak, prevStreak),
        penaltyResult
      }
    },

    makeupCheckIn(habitId) {
      const habit = this.getHabitById(habitId)
      if (!habit) {
        return { success: false, message: '没有找到这项习惯' }
      }

      const targetDate = getTodayString(shiftDate(new Date(), -1))
      const yesterdayRecord = this.getCheckRecord(habitId, targetDate)

      if (yesterdayRecord.checked) {
        return { success: false, message: '昨天已经打过卡了' }
      }

      const typeConfig = HABIT_TYPE_CONFIG[habit.type] || HABIT_TYPE_CONFIG.easy
      const makeupCost = typeConfig.gold * 2

      const userStore = useUserStore()
      const spendResult = userStore.spendGold(makeupCost, '习惯补卡', {
        habitId,
        date: targetDate,
        isMakeup: true
      })

      if (!spendResult.success) {
        return { success: false, message: `补卡需要消耗 ${makeupCost} 金豆，${spendResult.message}` }
      }

      this.setCheckRecord(habitId, targetDate, {
        checked: true,
        isMakeup: true,
        checkedAt: new Date().toISOString()
      })

      this.persist()

      return {
        success: true,
        cost: makeupCost,
        newStreak: this.getStreakDays(habitId),
        message: `补卡成功，消耗 ${makeupCost} 金豆`
      }
    },

    checkAndApplyStreakBreak(habitId, date = getTodayString()) {
      const habit = this.getHabitById(habitId)
      if (!habit) return null

      const record = this.getCheckRecord(habitId, date)
      if (record.checked) return null
      if (record.penaltyApplied) return null

      // 从昨天开始往前找，跳过断签间隔，找到最近一次连续记录
      let cursor = shiftDate(new Date(date), -1)
      let streakBeforeBreak = 0
      let gapPassed = false

      for (let i = 0; i < 3650; i++) {
        const cursorDate = getTodayString(cursor)
        const cursorRecord = this.getCheckRecord(habitId, cursorDate)
        if (cursorRecord.checked) {
          streakBeforeBreak++
          gapPassed = true
        } else if (gapPassed) {
          break
        }
        cursor = shiftDate(cursor, -1)
      }

      if (streakBeforeBreak < 7) return null

      const penalty = getStreakBreakPenalty(streakBeforeBreak)
      if (penalty <= 0) return null

      const userStore = useUserStore()
      if (userStore.gold >= penalty) {
        userStore.spendGold(penalty, `断签惩罚：${habit.name}（断签前连续${streakBeforeBreak}天）`, {
          habitId,
          streakBeforeBreak,
          isPenalty: true
        })
      }

      this.setCheckRecord(habitId, date, {
        ...record,
        penaltyApplied: true,
        penaltyAmount: penalty,
        streakBeforeBreak
      })
      this.persist()

      return { streakBeforeBreak, penalty }
    }
  }
})
