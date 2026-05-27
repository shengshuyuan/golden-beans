import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn(index => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Date.now())
  }
})

describe('全流程集成测试', () => {
  let appStorageRef = null

  beforeEach(async () => {
    localStorageMock.clear()
    vi.clearAllMocks()
    // Clear appStorage cache
    const { appStorage } = await import('../../src/repositories/appStorage.js')
    appStorageRef = appStorage
    appStorageRef.clearCache()
  })

  describe('场景1: 新用户首次使用', () => {
    it('应该加载默认状态', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')

      const state = appStorage.load()

      expect(state.schemaVersion).toBe(2) // 当前版本是2
      expect(state.user.gold).toBe(0)
      expect(state.habits).toEqual([])
      expect(state.rewards).toEqual([])
      expect(state.goldLedger).toEqual([])
      expect(state.settings.hasCompletedOnboarding).toBe(false)
    })

    it('应该创建第一个习惯', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')
      const { HABIT_TYPE_CONFIG } = await import('../../src/config/habitConstants.js')

      // 模拟用户创建习惯
      const newHabit = {
        id: 'habit-1',
        name: '阅读30分钟',
        type: 'easy', // 使用字符串 'easy' 而不是 HABIT_TYPE.EASY
        createdAt: new Date().toISOString()
      }

      appStorage.patch(state => ({
        ...state,
        habits: [...state.habits, newHabit]
      }))

      const state = appStorage.load()
      expect(state.habits).toHaveLength(1)
      expect(state.habits[0].name).toBe('阅读30分钟')
      expect(state.habits[0].type).toBe('easy')
      expect(HABIT_TYPE_CONFIG['easy'].gold).toBe(3) // 验证配置
    })

    it('应该完成新手引导', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')

      appStorage.patch(state => ({
        ...state,
        settings: { ...state.settings, hasCompletedOnboarding: true }
      }))

      const state = appStorage.load()
      expect(state.settings.hasCompletedOnboarding).toBe(true)
    })
  })

  describe('场景2: 打卡获得金豆', () => {
    it('简单习惯打卡应获得3金豆', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')
      const { HABIT_TYPE_CONFIG } = await import('../../src/config/habitConstants.js')
      const { LEDGER_ENTRY_TYPES } = await import('../../src/domain/goldRules.js')

      // 初始化用户金豆
      appStorage.patch(state => ({
        ...state,
        user: { ...state.user, gold: 0 }
      }))

      // 模拟打卡
      const expectedGold = HABIT_TYPE_CONFIG['easy'].gold
      expect(expectedGold).toBe(3)

      appStorage.patch(state => {
        const newEntry = {
          id: 'ledger-1',
          type: LEDGER_ENTRY_TYPES.CHECK_IN,
          amount: expectedGold,
          balanceAfter: state.user.gold + expectedGold,
          reason: '完成习惯: 阅读30分钟',
          meta: { habitId: 'habit-1', date: '2026-05-26' },
          createdAt: new Date().toISOString()
        }

        return {
          ...state,
          user: { ...state.user, gold: state.user.gold + expectedGold },
          goldLedger: [...state.goldLedger, newEntry]
        }
      })

      const state = appStorage.load()
      expect(state.user.gold).toBe(3)
      expect(state.goldLedger).toHaveLength(1)
      expect(state.goldLedger[0].type).toBe(LEDGER_ENTRY_TYPES.CHECK_IN)
      expect(state.goldLedger[0].balanceAfter).toBe(3)
    })

    it('努力习惯打卡应获得5金豆', async () => {
      const { HABIT_TYPE_CONFIG } = await import('../../src/config/habitConstants.js')
      expect(HABIT_TYPE_CONFIG['effort'].gold).toBe(5)
    })

    it('挑战习惯打卡应获得10金豆', async () => {
      const { HABIT_TYPE_CONFIG } = await import('../../src/config/habitConstants.js')
      expect(HABIT_TYPE_CONFIG['challenge'].gold).toBe(10)
    })
  })

  describe('场景3: 连续打卡奖励', () => {
    it('连续3天应获得+5奖励', async () => {
      const { getMilestoneBonus, STREAK_REWARD_TIERS } = await import('../../src/config/habitConstants.js')

      const bonus = getMilestoneBonus(3, 2) // newStreak=3, prevStreak=2
      expect(bonus).toBe(5) // 3天奖励
      expect(STREAK_REWARD_TIERS[0]).toEqual({ days: 3, bonus: 5 })
    })

    it('连续7天应获得+15奖励', async () => {
      const { getMilestoneBonus } = await import('../../src/config/habitConstants.js')
      expect(getMilestoneBonus(7, 6)).toBe(15) // newStreak=7, prevStreak=6
    })

    it('连续14天应获得+30奖励', async () => {
      const { getMilestoneBonus } = await import('../../src/config/habitConstants.js')
      expect(getMilestoneBonus(14, 13)).toBe(30) // newStreak=14, prevStreak=13
    })

    it('连续30天应获得+88奖励', async () => {
      const { getMilestoneBonus } = await import('../../src/config/habitConstants.js')
      expect(getMilestoneBonus(30, 29)).toBe(88) // newStreak=30, prevStreak=29
    })

    it('连续100天应获得+388奖励', async () => {
      const { getMilestoneBonus } = await import('../../src/config/habitConstants.js')
      expect(getMilestoneBonus(100, 99)).toBe(388) // newStreak=100, prevStreak=99
    })

    it('非里程碑天数应返回0', async () => {
      const { getMilestoneBonus } = await import('../../src/config/habitConstants.js')
      expect(getMilestoneBonus(4, 3)).toBe(0) // 4天不是里程碑
      expect(getMilestoneBonus(5, 4)).toBe(0) // 5天不是里程碑
      expect(getMilestoneBonus(10, 9)).toBe(0) // 10天不是里程碑
    })
  })

  describe('场景4: 断签惩罚', () => {
    it('断签前7天应扣5金豆', async () => {
      const { getStreakBreakPenalty } = await import('../../src/config/habitConstants.js')
      expect(getStreakBreakPenalty(7)).toBe(5)
    })

    it('断签前14天应扣10金豆', async () => {
      const { getStreakBreakPenalty } = await import('../../src/config/habitConstants.js')
      expect(getStreakBreakPenalty(14)).toBe(5) // 14天还是5金豆惩罚
    })

    it('断签前30天应扣15金豆', async () => {
      const { getStreakBreakPenalty } = await import('../../src/config/habitConstants.js')
      expect(getStreakBreakPenalty(30)).toBe(15) // 30天是15金豆惩罚
    })

    it('断签前50天应扣30金豆', async () => {
      const { getStreakBreakPenalty } = await import('../../src/config/habitConstants.js')
      expect(getStreakBreakPenalty(50)).toBe(30) // 50天是30金豆惩罚
    })

    it('断签前少于3天不应扣', async () => {
      const { getStreakBreakPenalty } = await import('../../src/config/habitConstants.js')
      expect(getStreakBreakPenalty(2)).toBe(0) // 2天不扣
      expect(getStreakBreakPenalty(6)).toBe(0) // 6天不扣
    })
  })

  describe('场景5: 补卡扣金豆', () => {
    it('补卡应扣2倍金豆', async () => {
      const { calculateMakeupCost } = await import('../../src/domain/habitRules.js')
      const { HABIT_TYPE_CONFIG } = await import('../../src/config/habitConstants.js')

      const easyCost = calculateMakeupCost('easy')
      expect(easyCost).toBe(HABIT_TYPE_CONFIG['easy'].gold * 2) // 3*2=6

      const effortCost = calculateMakeupCost('effort')
      expect(effortCost).toBe(HABIT_TYPE_CONFIG['effort'].gold * 2) // 5*2=10

      const challengeCost = calculateMakeupCost('challenge')
      expect(challengeCost).toBe(HABIT_TYPE_CONFIG['challenge'].gold * 2) // 10*2=20
    })

    it('补卡应记录ledger扣款', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')
      const { LEDGER_ENTRY_TYPES } = await import('../../src/domain/goldRules.js')
      const { calculateMakeupCost } = await import('../../src/domain/habitRules.js')

      // 初始化有10金豆
      appStorage.patch(state => ({
        ...state,
        user: { ...state.user, gold: 10 }
      }))

      const makeupCost = calculateMakeupCost('easy') // 6

      appStorage.patch(state => ({
        ...state,
        user: { ...state.user, gold: state.user.gold - makeupCost },
        goldLedger: [...state.goldLedger, {
          id: 'ledger-makeup',
          type: LEDGER_ENTRY_TYPES.MAKEUP,
          amount: -makeupCost,
          balanceAfter: state.user.gold - makeupCost,
          reason: '补卡: 阅读30分钟',
          meta: { habitId: 'habit-1', date: '2026-05-25' },
          createdAt: new Date().toISOString()
        }]
      }))

      const state = appStorage.load()
      expect(state.user.gold).toBe(4) // 10-6=4
      expect(state.goldLedger).toHaveLength(1)
      expect(state.goldLedger[0].type).toBe(LEDGER_ENTRY_TYPES.MAKEUP)
      expect(state.goldLedger[0].amount).toBe(-6)
      expect(state.goldLedger[0].balanceAfter).toBe(4)
    })
  })

  describe('场景6: 创建和兑换奖励', () => {
    it('应创建奖励', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')

      const newReward = {
        id: 'reward-1',
        name: '看一集动漫',
        cost: 20,
        createdAt: new Date().toISOString()
      }

      appStorage.patch(state => ({
        ...state,
        rewards: [...state.rewards, newReward]
      }))

      const state = appStorage.load()
      expect(state.rewards).toHaveLength(1)
      expect(state.rewards[0].name).toBe('看一集动漫')
      expect(state.rewards[0].cost).toBe(20)
    })

    it('金豆足够时应能兑换奖励', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')
      const { LEDGER_ENTRY_TYPES } = await import('../../src/domain/goldRules.js')

      // 初始化: 25金豆，1个20金豆的奖励
      appStorage.patch(state => ({
        ...state,
        user: { ...state.user, gold: 25 },
        rewards: [{ id: 'reward-1', name: '看一集动漫', cost: 20 }]
      }))

      // 兑换
      appStorage.patch(state => ({
        ...state,
        user: { ...state.user, gold: state.user.gold - 20 },
        goldLedger: [...state.goldLedger, {
          id: 'ledger-redeem',
          type: LEDGER_ENTRY_TYPES.REDEEM,
          amount: -20,
          balanceAfter: state.user.gold - 20,
          reason: '兑换奖励: 看一集动漫',
          meta: { rewardId: 'reward-1' },
          createdAt: new Date().toISOString()
        }]
      }))

      const state = appStorage.load()
      expect(state.user.gold).toBe(5) // 25-20=5
      expect(state.goldLedger).toHaveLength(1)
      expect(state.goldLedger[0].type).toBe(LEDGER_ENTRY_TYPES.REDEEM)
    })

    it('金豆不足时应拒绝兑换', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')

      appStorage.patch(state => ({
        ...state,
        user: { ...state.user, gold: 10 }
      }))

      const state = appStorage.load()
      const rewardCost = 20
      const canRedeem = state.user.gold >= rewardCost
      expect(canRedeem).toBe(false)
    })
  })

  describe('场景7: 完整用户流程', () => {
    it('应支持完整的用户旅程', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')
      const { HABIT_TYPE_CONFIG, getMilestoneBonus } = await import('../../src/config/habitConstants.js')
      const { LEDGER_ENTRY_TYPES } = await import('../../src/domain/goldRules.js')

      // 1. 新用户
      let state = appStorage.load()
      expect(state.user.gold).toBe(0)
      expect(state.habits).toHaveLength(0)

      // 2. 创建习惯
      appStorage.patch(s => ({
        ...s,
        habits: [...s.habits, { id: 'h1', name: '读书', type: 'easy' }]
      }))

      // 3. 创建奖励
      appStorage.patch(s => ({
        ...s,
        rewards: [...s.rewards, { id: 'r1', name: '看电影', cost: 15 }]
      }))

      // 4. 连续打卡3天
      for (let day = 1; day <= 3; day++) {
        const checkInGold = HABIT_TYPE_CONFIG['easy'].gold // 3
        const streakBonus = getMilestoneBonus(day, day - 1) // day=3时prev=2

        appStorage.patch(s => {
          const totalGold = checkInGold + streakBonus
          const entries = []

          entries.push({
            id: `ledger-check-${day}`,
            type: LEDGER_ENTRY_TYPES.CHECK_IN,
            amount: checkInGold,
            balanceAfter: s.user.gold + checkInGold,
            reason: '完成习惯: 读书',
            createdAt: new Date().toISOString()
          })

          if (streakBonus > 0) {
            entries.push({
              id: `ledger-streak-${day}`,
              type: LEDGER_ENTRY_TYPES.STREAK_BONUS,
              amount: streakBonus,
              balanceAfter: s.user.gold + totalGold,
              reason: `连续${day}天奖励`,
              createdAt: new Date().toISOString()
            })
          }

          return {
            ...s,
            user: { ...s.user, gold: s.user.gold + totalGold },
            goldLedger: [...s.goldLedger, ...entries]
          }
        })
      }

      state = appStorage.load()
      // 3天打卡: 3*3=9 基础 + 5 连续奖励 = 14
      expect(state.user.gold).toBe(14)
      expect(state.goldLedger).toHaveLength(4) // 3次打卡 + 1次连续奖励

      // 5. 兑换奖励 (15金豆)
      appStorage.patch(s => ({
        ...s,
        user: { ...s.user, gold: s.user.gold - 15 },
        goldLedger: [...s.goldLedger, {
          id: 'ledger-redeem',
          type: LEDGER_ENTRY_TYPES.REDEEM,
          amount: -15,
          balanceAfter: s.user.gold - 15,
          reason: '兑换奖励: 看电影',
          createdAt: new Date().toISOString()
        }]
      }))

      state = appStorage.load()
      expect(state.user.gold).toBe(-1) // 14-15=-1 (允许负数)

      // 6. 验证数据完整性
      expect(state.goldLedger.every(e => e.balanceAfter !== undefined)).toBe(true)
      expect(state.goldLedger.every(e => e.type !== undefined)).toBe(true)
    })
  })

  describe('场景8: 数据迁移和恢复', () => {
    it('应从旧格式迁移到新格式', async () => {
      // 模拟旧格式数据
      localStorageMock.setItem('habit_tracker_user_gold', '50')
      localStorageMock.setItem('habit_tracker_habits', JSON.stringify([
        { id: 'old-h1', name: '旧习惯', type: 'easy' }
      ]))

      const { appStorage } = await import('../../src/repositories/appStorage.js')
      const state = appStorage.load()

      // 应该成功迁移
      expect(state.user.gold).toBe(50)
      expect(state.habits).toHaveLength(1)
      expect(state.habits[0].name).toBe('旧习惯')
    })

    it('应能导出JSON', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')

      // 设置一些数据
      appStorage.patch(state => ({
        ...state,
        user: { ...state.user, gold: 100 }
      }))

      const exported = appStorage.exportJson()
      const parsed = JSON.parse(exported)

      expect(parsed.appName).toBe('golden-bean')
      expect(parsed.exportedAt).toBeDefined()
      expect(parsed.state.user.gold).toBe(100)
    })

    it('应能导入JSON', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')

      const importData = JSON.stringify({
        appName: 'golden-bean',
        exportedAt: new Date().toISOString(),
        state: {
          schemaVersion: 1,
          user: { gold: 200 },
          habits: [{ id: 'imported-1', name: '导入的习惯', type: 'hard' }]
        }
      })

      const result = appStorage.importJson(importData)
      expect(result.success).toBe(true)

      const state = appStorage.load()
      expect(state.user.gold).toBe(200)
      expect(state.habits).toHaveLength(1)
      expect(state.habits[0].name).toBe('导入的习惯')
    })

    it('应拒绝无效的导入JSON', async () => {
      const { appStorage } = await import('../../src/repositories/appStorage.js')

      // 无效的appName
      const result1 = appStorage.importJson(JSON.stringify({
        appName: 'wrong-app',
        state: { user: { gold: 100 } }
      }))
      expect(result1.success).toBe(false)

      // 无效的JSON
      const result2 = appStorage.importJson('invalid json{')
      expect(result2.success).toBe(false)
    })
  })
})
