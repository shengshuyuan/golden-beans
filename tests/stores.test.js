import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHabitStore } from '../src/stores/habit'
import { useUserStore } from '../src/stores/user'

function setup() {
  localStorage.clear()
  setActivePinia(createPinia())
  const habitStore = useHabitStore()
  const userStore = useUserStore()
  return { habitStore, userStore }
}

function addTestHabit(habitStore, overrides = {}) {
  return habitStore.addHabit({
    name: '阅读',
    type: 'easy',
    icon: '📚',
    ...overrides
  })
}

describe('habitStore', () => {
  let habitStore, userStore

  beforeEach(() => {
    ({ habitStore, userStore } = setup())
  })

  describe('addHabit', () => {
    it('adds a habit and returns it', () => {
      const habit = addTestHabit(habitStore)
      expect(habit).toBeTruthy()
      expect(habit.name).toBe('阅读')
      expect(habit.type).toBe('easy')
      expect(habit.id).toBeTruthy()
    })

    it('defaults missing fields', () => {
      const habit = habitStore.addHabit({ name: 'test' })
      expect(habit.type).toBe('easy')
      expect(habit.archived).toBe(false)
    })
  })

  describe('getStreakDays', () => {
    it('returns 0 for unchecked habit', () => {
      const habit = addTestHabit(habitStore)
      expect(habitStore.getStreakDays(habit.id)).toBe(0)
    })

    it('returns 1 after single checkin', () => {
      const habit = addTestHabit(habitStore)
      habitStore.checkIn(habit.id)
      expect(habitStore.getStreakDays(habit.id)).toBe(1)
    })
  })

  describe('getLongestStreak', () => {
    it('returns 0 with no records', () => {
      const habit = addTestHabit(habitStore)
      expect(habitStore.getLongestStreak(habit.id)).toBe(0)
    })
  })

  describe('checkIn', () => {
    it('fails for non-existent habit', () => {
      const result = habitStore.checkIn('nonexistent')
      expect(result.success).toBe(false)
    })

    it('awards base gold for easy habit', () => {
      // Add 2 habits so completing 1 doesn't trigger allClearBonus
      addTestHabit(habitStore, { name: '早起' })
      const habit = addTestHabit(habitStore, { type: 'easy' })
      const result = habitStore.checkIn(habit.id)
      expect(result.success).toBe(true)
      expect(result.baseGold).toBe(3)
      expect(result.allClearBonus).toBe(0)
      // First daily check-in gets +2 bonus
      expect(userStore.gold).toBe(3 + 2)
    })

    it('awards correct gold for effort habit', () => {
      const habit = addTestHabit(habitStore, { type: 'effort' })
      const result = habitStore.checkIn(habit.id)
      expect(result.baseGold).toBe(5)
    })

    it('awards correct gold for challenge habit', () => {
      const habit = addTestHabit(habitStore, { type: 'challenge' })
      const result = habitStore.checkIn(habit.id)
      expect(result.baseGold).toBe(10)
    })

    it('prevents double checkin', () => {
      const habit = addTestHabit(habitStore)
      habitStore.checkIn(habit.id)
      const result = habitStore.checkIn(habit.id)
      expect(result.success).toBe(false)
      expect(result.message).toContain('已经打过卡了')
    })

    it('awards allClearBonus when last habit completed', () => {
      const h1 = addTestHabit(habitStore, { name: '早起' })
      const h2 = addTestHabit(habitStore, { name: '阅读' })
      habitStore.checkIn(h1.id)
      const result = habitStore.checkIn(h2.id)
      expect(result.allClearBonus).toBe(3)
    })

    it('does not award allClearBonus when more habits pending', () => {
      addTestHabit(habitStore, { name: '早起' })
      addTestHabit(habitStore, { name: '阅读' })
      const habit = addTestHabit(habitStore, { name: '运动' })
      const result = habitStore.checkIn(habit.id)
      expect(result.allClearBonus).toBe(0)
    })

    it('creates a ledger entry', () => {
      // Add 2 habits so completing 1 doesn't trigger allClearBonus
      addTestHabit(habitStore, { name: '早起' })
      const habit = addTestHabit(habitStore, { type: 'easy' })
      habitStore.checkIn(habit.id)
      expect(userStore.ledger.length).toBeGreaterThan(0)
      // First daily check-in: 3 base + 2 bonus = 5
      expect(userStore.ledger[0].amount).toBe(5)
    })
  })

  describe('makeupCheckIn', () => {
    it('fails for non-existent habit', () => {
      const result = habitStore.makeupCheckIn('nonexistent')
      expect(result.success).toBe(false)
    })

    it('deducts 2x gold for makeup', () => {
      const habit = addTestHabit(habitStore, { type: 'easy' })
      userStore.addGold(20, 'test')
      expect(userStore.gold).toBe(20)

      const result = habitStore.makeupCheckIn(habit.id)
      expect(result.success).toBe(true)
      expect(result.cost).toBe(6) // 3 * 2
      expect(userStore.gold).toBe(14)
    })

    it('fails when insufficient gold', () => {
      const habit = addTestHabit(habitStore, { type: 'easy' })
      const result = habitStore.makeupCheckIn(habit.id)
      expect(result.success).toBe(false)
      expect(result.message).toContain('金豆')
    })

    it('marks record as makeup', () => {
      const habit = addTestHabit(habitStore, { type: 'easy' })
      userStore.addGold(20, 'test')
      habitStore.makeupCheckIn(habit.id)
      const { shiftDate } = require('../src/utils/date')
      const { getTodayString } = require('../src/utils/date')
      const yesterday = getTodayString(shiftDate(new Date(), -1))
      const record = habitStore.getCheckRecord(habit.id, yesterday)
      expect(record.checked).toBe(true)
      expect(record.isMakeup).toBe(true)
    })
  })

  describe('archive and restore', () => {
    it('archives a habit', () => {
      const habit = addTestHabit(habitStore)
      habitStore.archiveHabit(habit.id)
      const updated = habitStore.getHabitById(habit.id)
      expect(updated.archived).toBe(true)
    })

    it('restores a habit', () => {
      const habit = addTestHabit(habitStore)
      habitStore.archiveHabit(habit.id)
      habitStore.restoreHabit(habit.id)
      const updated = habitStore.getHabitById(habit.id)
      expect(updated.archived).toBe(false)
    })

    it('archived habits not in activeHabits', () => {
      const habit = addTestHabit(habitStore)
      habitStore.archiveHabit(habit.id)
      expect(habitStore.activeHabits).toHaveLength(0)
    })
  })

  describe('deleteHabit', () => {
    it('removes the habit', () => {
      const habit = addTestHabit(habitStore)
      habitStore.deleteHabit(habit.id)
      expect(habitStore.getHabitById(habit.id)).toBeNull()
    })
  })
})

describe('userStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('addGold increases balance and creates ledger entry', () => {
    const userStore = useUserStore()
    userStore.addGold(10, 'test reason')
    expect(userStore.gold).toBe(10)
    expect(userStore.ledger).toHaveLength(1)
    expect(userStore.ledger[0].amount).toBe(10)
    expect(userStore.ledger[0].reason).toBe('test reason')
  })

  it('spendGold decreases balance', () => {
    const userStore = useUserStore()
    userStore.addGold(20, 'earn')
    const result = userStore.spendGold(8, 'redeem')
    expect(result.success).toBe(true)
    expect(userStore.gold).toBe(12)
  })

  it('spendGold fails with insufficient balance', () => {
    const userStore = useUserStore()
    userStore.addGold(5, 'earn')
    const result = userStore.spendGold(10, 'redeem')
    expect(result.success).toBe(false)
    expect(userStore.gold).toBe(5)
  })

  it('spendGold fails with zero/negative amount', () => {
    const userStore = useUserStore()
    expect(userStore.spendGold(0).success).toBe(false)
    expect(userStore.spendGold(-5).success).toBe(false)
  })

  it('addGold ignores zero/negative', () => {
    const userStore = useUserStore()
    userStore.addGold(0, 'test')
    userStore.addGold(-5, 'test')
    expect(userStore.gold).toBe(0)
    expect(userStore.ledger).toHaveLength(0)
  })

  it('getStatistics returns totals', () => {
    const userStore = useUserStore()
    userStore.addGold(10, 'earn')
    userStore.addGold(5, 'earn')
    userStore.spendGold(3, 'redeem')
    const stats = userStore.getStatistics()
    expect(stats.totalEarned).toBe(15)
    expect(stats.totalSpent).toBe(3)
  })
})

describe('rewardStore', () => {
  let habitStore, userStore, rewardStore

  beforeEach(async () => {
    localStorage.clear()
    setActivePinia(createPinia())
    const { useRewardStore } = await import('../src/stores/reward')
    habitStore = useHabitStore()
    userStore = useUserStore()
    rewardStore = useRewardStore()
  })

  it('redeemReward succeeds with enough gold', () => {
    userStore.addGold(20, 'test')
    const reward = rewardStore.addReward({ name: '看电影', cost: 10 })
    const result = rewardStore.redeemReward(reward.id)
    expect(result.success).toBe(true)
    expect(userStore.gold).toBe(10)
    expect(rewardStore.redeemRecords).toHaveLength(1)
  })

  it('redeemReward fails with insufficient gold', () => {
    userStore.addGold(5, 'test')
    const reward = rewardStore.addReward({ name: '看电影', cost: 10 })
    const result = rewardStore.redeemReward(reward.id)
    expect(result.success).toBe(false)
    expect(userStore.gold).toBe(5)
  })

  it('redeemReward fails for non-existent reward', () => {
    const result = rewardStore.redeemReward('nonexistent')
    expect(result.success).toBe(false)
  })

  it('deleteReward removes the reward', () => {
    const reward = rewardStore.addReward({ name: 'test', cost: 5 })
    rewardStore.deleteReward(reward.id)
    expect(rewardStore.getRewardById(reward.id)).toBeNull()
  })
})
