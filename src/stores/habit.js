import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '../utils/storage'
import { getTodayString, isYesterday, getDateDiff } from '../utils/date'

// 习惯类型枚举
export const HABIT_TYPES = {
  SIMPLE: 'simple',      // 简单习惯
  EFFORT: 'effort',      // 努力习惯
  CHALLENGE: 'challenge' // 挑战习惯
}

// 习惯类型配置
export const HABIT_TYPE_CONFIG = {
  [HABIT_TYPES.SIMPLE]: {
    name: '简单习惯',
    gold: 3,
    icon: '✨',
    color: '#00B894'
  },
  [HABIT_TYPES.EFFORT]: {
    name: '努力习惯',
    gold: 5,
    icon: '🚀',
    color: '#0984E3'
  },
  [HABIT_TYPES.CHALLENGE]: {
    name: '挑战习惯',
    gold: 10,
    icon: '🏆',
    color: '#FF9F43'
  }
}

// 连续打卡奖励
const STREAK_REWARDS = {
  3: 5,
  7: 15,
  14: 30,
  21: 50,
  30: 88,
  60: 168,
  100: 388,
  180: 688,
  365: 1688
}

// 断签惩罚
const BREAK_PENALTY = {
  7: 5,
  30: 15,
  50: 30
}

const LEGACY_DEFAULT_ICONS = new Set(['🌱', '🌿', '🌳'])

export const useHabitStore = defineStore('habit', () => {
  // 状态
  const habits = ref([])
  const checkRecords = ref({}) // { 'habitId': { '2024-01-01': { checked: true, isMakeup: false } } }
  const CURRENT_VERSION = 2

  // 初始化
  function init() {
    habits.value = storage.get('habits', [])
    checkRecords.value = storage.get('checkRecords', {})
    const version = storage.get('habitDataVersion', 1)

    let changed = false

    // 数据迁移
    if (version < 2) {
      habits.value = habits.value.map(habit => {
        if (LEGACY_DEFAULT_ICONS.has(habit.icon)) {
          return { ...habit, icon: '' }
        }
        return habit
      })
      
      // 其他版本 < 2 的迁移逻辑可以放在这里
      changed = true
      storage.set('habitDataVersion', CURRENT_VERSION)
    }

    // 检查断签
    checkMissedDays()

    if (changed) {
      saveData()
    }
  }

  // 获取今日打卡记录
  const todayRecords = computed(() => {
    const today = getTodayString()
    const records = {}

    habits.value.filter(h => !h.archived).forEach(habit => {
      records[habit.id] = getCheckRecord(habit.id, today)
    })

    return records
  })

  // 获取今日待完成的习惯
  const todayPendingHabits = computed(() => {
    return habits.value.filter(h => !h.archived && !todayRecords.value[h.id]?.checked)
  })

  // 获取今日已完成的习惯
  const todayCompletedHabits = computed(() => {
    return habits.value.filter(h => !h.archived && todayRecords.value[h.id]?.checked)
  })

  // 今日是否全部完成
  const isAllCompletedToday = computed(() => {
    return habits.value.filter(h => !h.archived).length > 0 &&
           todayPendingHabits.value.length === 0
  })

  // 获取打卡记录
  function getCheckRecord(habitId, date) {
    return checkRecords.value[habitId]?.[date] || { checked: false, isMakeup: false }
  }

  // 获取习惯的连续天数
  function getStreakDays(habitId) {
    const habitRecords = checkRecords.value[habitId]
    if (!habitRecords) return 0

    let streak = 0
    let currentDate = new Date()
    const today = getTodayString()

    // 如果今天已打卡，从今天开始算
    if (habitRecords[today]?.checked) {
      streak = 1
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // 否则从昨天开始算
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // 往前遍历
    while (true) {
      const dateStr = getTodayString(currentDate)
      if (habitRecords[dateStr]?.checked) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  // 检查断签并扣除金豆
  function checkMissedDays() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = getTodayString(yesterday)

    const userStore = useUserStore()

    habits.value.forEach(habit => {
      if (habit.archived) return

      const record = getCheckRecord(habit.id, yesterdayStr)
      if (!record.checked && !record.penaltyApplied) {
        // 昨天没打卡，检查是否需要扣金豆
        // 计算断签前的实际连续天数（从前天开始往前算）
        let streakBefore = 0
        const checkDate = new Date(yesterday)
        checkDate.setDate(checkDate.getDate() - 1) // 从前天开始

        const habitRecords = checkRecords.value[habit.id]
        if (habitRecords) {
          while (true) {
            const dateStr = getTodayString(checkDate)
            if (habitRecords[dateStr]?.checked) {
              streakBefore++
              checkDate.setDate(checkDate.getDate() - 1)
            } else {
              break
            }
          }
        }

        // 应用惩罚
        let penalty = 0
        if (streakBefore >= 50) {
          penalty = BREAK_PENALTY[50]
        } else if (streakBefore >= 30) {
          penalty = BREAK_PENALTY[30]
        } else if (streakBefore >= 7) {
          penalty = BREAK_PENALTY[7]
        }

        if (penalty > 0) {
          userStore.deductGold(penalty, `断签惩罚：${habit.name}`)
        }

        // 标记已处理
        checkRecords.value[habit.id] = {
          ...checkRecords.value[habit.id],
          [yesterdayStr]: {
            ...record,
            penaltyApplied: true,
            penaltyAmount: penalty
          }
        }

        saveData()
      }
    })
  }

  // 打卡
  function checkIn(habitId) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return { success: false, message: '习惯不存在' }

    const today = getTodayString()
    const existingRecord = getCheckRecord(habitId, today)

    if (existingRecord.checked) {
      return { success: false, message: '今日已打卡' }
    }

    // 记录打卡前的连续天数
    const streakBefore = getStreakDays(habitId)

    // 创建打卡记录
    checkRecords.value[habitId] = {
      ...checkRecords.value[habitId],
      [today]: {
        checked: true,
        isMakeup: false,
        streakBefore,
        timestamp: Date.now()
      }
    }

    // 计算金豆奖励
    const config = HABIT_TYPE_CONFIG[habit.type]
    let goldEarned = config.gold

    // 检查连续打卡奖励
    const newStreak = streakBefore + 1
    let streakReward = 0

    for (const [days, reward] of Object.entries(STREAK_REWARDS)) {
      if (newStreak === parseInt(days)) {
        streakReward = reward
        break
      }
    }

    const userStore = useUserStore()

    // 添加基础打卡金豆
    userStore.addGold(goldEarned, `打卡：${habit.name}`)

    // 添加连续打卡奖励
    if (streakReward > 0) {
      userStore.addGold(streakReward, `连续${newStreak}天奖励：${habit.name}`)
    }

    // 检查是否全部完成
    const allCompleted = todayPendingHabits.value.length === 0 // 记录更新后，如果待完成为0则是全清
    if (allCompleted && habits.value.filter(h => !h.archived).length >= 1) {
      userStore.addGold(3, '完成今日所有习惯')
    }

    saveData()

    return {
      success: true,
      goldEarned,
      streakReward,
      newStreak,
      allCompleted
    }
  }

  // 补打卡（仅昨天）
  function makeupCheckIn(habitId) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return { success: false, message: '习惯不存在' }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = getTodayString(yesterday)
    const today = getTodayString()

    const existingRecord = getCheckRecord(habitId, yesterdayStr)

    if (existingRecord.checked) {
      return { success: false, message: '昨天已打卡' }
    }

    // 计算补打卡消耗（双倍）
    const config = HABIT_TYPE_CONFIG[habit.type]
    const makeupCost = config.gold * 2

    const userStore = useUserStore()

    // 使用 hasEnoughGold 检查余额
    if (!userStore.hasEnoughGold(makeupCost)) {
      return { success: false, message: '金豆不足', cost: makeupCost }
    }

    // 扣除金豆
    const deductResult = userStore.deductGold(makeupCost, `补打卡：${habit.name}`)
    if (!deductResult.success) {
      return { success: false, message: '金豆扣除失败', ...deductResult }
    }

    // 如果昨天有扣除过断签惩罚，则退还
    if (existingRecord.penaltyApplied && existingRecord.penaltyAmount > 0) {
      userStore.addGold(existingRecord.penaltyAmount, `退还断签惩罚：${habit.name}`)
    }

    // 在补卡前检查今天的打卡状态（修复：提前检查，避免使用过时的 habitRecords）
    const todayChecked = getCheckRecord(habitId, today).checked

    // 计算补卡前的连续天数（从前天往前算）
    let streakBefore = 0
    const checkDate = new Date(yesterday)
    checkDate.setDate(checkDate.getDate() - 1) // 从前天开始

    const habitRecords = checkRecords.value[habitId] || {}
    while (true) {
      const dateStr = getTodayString(checkDate)
      if (habitRecords[dateStr]?.checked) {
        streakBefore++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // 记录补打卡（修复：清除惩罚标记）
    checkRecords.value[habitId] = {
      ...checkRecords.value[habitId],
      [yesterdayStr]: {
        ...existingRecord,
        checked: true,
        isMakeup: true,
        streakBefore,
        penaltyApplied: false,  // 清除惩罚标记
        penaltyAmount: 0,
        timestamp: Date.now()
      }
    }

    // 补卡后的连续天数（使用提前检查的 todayChecked）
    const newStreak = todayChecked ? streakBefore + 2 : streakBefore + 1

    saveData()

    return {
      success: true,
      cost: makeupCost,
      newStreak
    }
  }

  // 添加习惯
  function addHabit(habit) {
    const newHabit = {
      id: Date.now().toString(),
      ...habit,
      createdAt: new Date().toISOString(),
      archived: false
    }

    habits.value.push(newHabit)
    saveData()

    return newHabit
  }

  // 更新习惯
  function updateHabit(id, updates) {
    const index = habits.value.findIndex(h => h.id === id)
    if (index !== -1) {
      habits.value[index] = { ...habits.value[index], ...updates }
      saveData()
    }
  }

  // 归档习惯
  function archiveHabit(id) {
    updateHabit(id, { archived: true })
  }

  // 恢复习惯
  function restoreHabit(id) {
    updateHabit(id, { archived: false })
  }

  // 删除习惯
  function deleteHabit(id) {
    const index = habits.value.findIndex(h => h.id === id)
    if (index !== -1) {
      habits.value.splice(index, 1)
      delete checkRecords.value[id]
      saveData()
    }
  }

  // 保存数据
  function saveData() {
    storage.set('habits', habits.value)
    storage.set('checkRecords', checkRecords.value)
  }

  return {
    habits,
    checkRecords,
    todayRecords,
    todayPendingHabits,
    todayCompletedHabits,
    isAllCompletedToday,
    init,
    getCheckRecord,
    getStreakDays,
    checkIn,
    makeupCheckIn,
    addHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit
  }
})

// 延迟导入避免循环依赖
import { useUserStore } from './user'
