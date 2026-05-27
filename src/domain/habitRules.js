import { HABIT_TYPE_CONFIG } from '../config/habitConstants'
import { getTodayString, shiftDate } from '../utils/date'

/**
 * Calculate the total reward for a check-in (pure function).
 * @param {object} params
 * @param {string} params.habitType - 'easy' | 'effort' | 'challenge'
 * @param {number} params.newStreak - streak after this check-in
 * @param {number} params.prevStreak - streak before this check-in
 * @param {number} params.pendingCount - remaining pending habits AFTER this one
 * @param {number} params.todayCompletedCount - how many habits completed today so far (including this one)
 * @param {number} params.streakBeforeBreak - streak before the most recent break (0 if no break)
 * @param {function} params.getMilestoneBonus - milestone bonus calculator
 * @returns {{ baseGold, streakBonus, allClearBonus, comebackBonus, firstCheckInBonus, totalGold }}
 */
export function calculateCheckInReward({ habitType, newStreak, prevStreak, pendingCount, todayCompletedCount = 1, streakBeforeBreak = 0, getMilestoneBonus }) {
  const typeConfig = HABIT_TYPE_CONFIG[habitType] || HABIT_TYPE_CONFIG.easy
  const baseGold = typeConfig.gold
  const streakBonus = getMilestoneBonus(newStreak, prevStreak)
  const allClearBonus = pendingCount === 0 ? 3 : 0
  const comebackBonus = getComebackReward(newStreak, streakBeforeBreak)
  const firstCheckInBonus = todayCompletedCount <= 1 ? 2 : 0
  return {
    baseGold,
    streakBonus,
    allClearBonus,
    comebackBonus,
    firstCheckInBonus,
    totalGold: baseGold + streakBonus + allClearBonus + comebackBonus + firstCheckInBonus
  }
}

/**
 * Calculate makeup cost (pure function).
 * @param {string} habitType - 'easy' | 'effort' | 'challenge'
 * @returns {number} cost in gold beans (2x base)
 */
export function calculateMakeupCost(habitType) {
  const typeConfig = HABIT_TYPE_CONFIG[habitType] || HABIT_TYPE_CONFIG.easy
  return typeConfig.gold * 2
}

/**
 * Calculate comeback reward for resuming after a break.
 * If the user broke a streak of 7+ days and now has a new streak of 3+ days, award bonus.
 * @param {number} newStreak - current streak after this check-in
 * @param {number} streakBeforeBreak - streak count before the break
 * @returns {number} bonus gold (0 if no comeback)
 */
export function getComebackReward(newStreak, streakBeforeBreak) {
  if (streakBeforeBreak < 7) return 0
  if (newStreak >= 3) return 10
  return 0
}

/**
 * Find the streak count before a break (pure function).
 * Scans backwards from `date`, skipping the gap, to find the most recent
 * consecutive streak that was broken.
 * @param {function} getRecord - (habitId, date) => record
 * @param {string} habitId
 * @param {string} date - the date being checked in
 * @returns {number} streak count before the break (0 if no break or streak < 7)
 */
export function findStreakBeforeBreak(getRecord, habitId, date) {
  let cursor = shiftDate(new Date(date), -1)
  let streakBeforeBreak = 0
  let gapPassed = false

  for (let i = 0; i < 3650; i++) {
    const cursorDate = getTodayString(cursor)
    const cursorRecord = getRecord(habitId, cursorDate)
    if (cursorRecord.checked) {
      streakBeforeBreak++
      gapPassed = true
    } else if (gapPassed) {
      break
    }
    cursor = shiftDate(cursor, -1)
  }

  return streakBeforeBreak
}
