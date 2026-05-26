import { HABIT_TYPE_CONFIG } from '../config/habitConstants'
import { getTodayString, shiftDate } from '../utils/date'

/**
 * Calculate the total reward for a check-in (pure function).
 * @param {object} params
 * @param {string} params.habitType - 'easy' | 'effort' | 'challenge'
 * @param {number} params.newStreak - streak after this check-in
 * @param {number} params.prevStreak - streak before this check-in
 * @param {number} params.pendingCount - remaining pending habits AFTER this one
 * @param {function} params.getMilestoneBonus - milestone bonus calculator
 * @returns {{ baseGold, streakBonus, allClearBonus, totalGold }}
 */
export function calculateCheckInReward({ habitType, newStreak, prevStreak, pendingCount, getMilestoneBonus }) {
  const typeConfig = HABIT_TYPE_CONFIG[habitType] || HABIT_TYPE_CONFIG.easy
  const baseGold = typeConfig.gold
  const streakBonus = getMilestoneBonus(newStreak, prevStreak)
  const allClearBonus = pendingCount === 0 ? 3 : 0
  return {
    baseGold,
    streakBonus,
    allClearBonus,
    totalGold: baseGold + streakBonus + allClearBonus
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
