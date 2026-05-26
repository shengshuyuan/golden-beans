import { describe, it, expect } from 'vitest'
import { calculateCheckInReward, calculateMakeupCost, findStreakBeforeBreak } from '../src/domain/habitRules'
import { getMilestoneBonus, getStreakBreakPenalty } from '../src/config/habitConstants'
import { createLedgerEntry, LEDGER_ENTRY_TYPES } from '../src/domain/goldRules'

/* ───────── habitRules ───────── */

describe('calculateCheckInReward', () => {
  it('returns base gold only when no streak milestone', () => {
    const r = calculateCheckInReward({
      habitType: 'easy', newStreak: 1, prevStreak: 0,
      pendingCount: 1, getMilestoneBonus
    })
    expect(r.baseGold).toBe(3)
    expect(r.streakBonus).toBe(0)
    expect(r.allClearBonus).toBe(0)
    expect(r.totalGold).toBe(3)
  })

  it('awards streak bonus at day 3 milestone', () => {
    const r = calculateCheckInReward({
      habitType: 'easy', newStreak: 3, prevStreak: 2,
      pendingCount: 1, getMilestoneBonus
    })
    expect(r.streakBonus).toBe(5)
    expect(r.totalGold).toBe(3 + 5)
  })

  it('awards streak bonus at day 7 milestone', () => {
    const r = calculateCheckInReward({
      habitType: 'effort', newStreak: 7, prevStreak: 6,
      pendingCount: 1, getMilestoneBonus
    })
    expect(r.streakBonus).toBe(15)
    expect(r.totalGold).toBe(5 + 15)
  })

  it('awards streak bonus at day 30 milestone', () => {
    const r = calculateCheckInReward({
      habitType: 'challenge', newStreak: 30, prevStreak: 29,
      pendingCount: 1, getMilestoneBonus
    })
    expect(r.streakBonus).toBe(88)
    expect(r.totalGold).toBe(10 + 88)
  })

  it('awards allClearBonus when last habit completed', () => {
    const r = calculateCheckInReward({
      habitType: 'easy', newStreak: 1, prevStreak: 0,
      pendingCount: 0, getMilestoneBonus
    })
    expect(r.allClearBonus).toBe(3)
    expect(r.totalGold).toBe(3 + 3)
  })

  it('combines streak + allClear bonuses', () => {
    const r = calculateCheckInReward({
      habitType: 'effort', newStreak: 7, prevStreak: 6,
      pendingCount: 0, getMilestoneBonus
    })
    expect(r.totalGold).toBe(5 + 15 + 3)
  })

  it('handles challenge type correctly', () => {
    const r = calculateCheckInReward({
      habitType: 'challenge', newStreak: 1, prevStreak: 0,
      pendingCount: 2, getMilestoneBonus
    })
    expect(r.baseGold).toBe(10)
  })

  it('defaults to easy for unknown type', () => {
    const r = calculateCheckInReward({
      habitType: 'unknown', newStreak: 1, prevStreak: 0,
      pendingCount: 1, getMilestoneBonus
    })
    expect(r.baseGold).toBe(3)
  })
})

describe('calculateMakeupCost', () => {
  it('returns 2x base gold for easy', () => {
    expect(calculateMakeupCost('easy')).toBe(6)
  })

  it('returns 2x base gold for effort', () => {
    expect(calculateMakeupCost('effort')).toBe(10)
  })

  it('returns 2x base gold for challenge', () => {
    expect(calculateMakeupCost('challenge')).toBe(20)
  })

  it('defaults to easy for unknown type', () => {
    expect(calculateMakeupCost('unknown')).toBe(6)
  })
})

describe('findStreakBeforeBreak', () => {
  function makeRecords(dates) {
    const map = new Map(dates.map(d => [d, { checked: true }]))
    return (habitId, date) => map.get(date) || { checked: false }
  }

  it('returns 0 when no previous records', () => {
    const getRecord = () => ({ checked: false })
    expect(findStreakBeforeBreak(getRecord, 'h1', '2026-05-26')).toBe(0)
  })

  it('finds streak of 3 before a 1-day gap', () => {
    // Records on 24, 23, 22; gap on 21; checking in on 25
    const getRecord = makeRecords(['2026-05-24', '2026-05-23', '2026-05-22'])
    expect(findStreakBeforeBreak(getRecord, 'h1', '2026-05-25')).toBe(3)
  })

  it('finds streak of 7 before a gap', () => {
    const dates = Array.from({ length: 7 }, (_, i) => `2026-05-${String(18 + i).padStart(2, '0')}`)
    const getRecord = makeRecords(dates)
    expect(findStreakBeforeBreak(getRecord, 'h1', '2026-05-26')).toBe(7)
  })

  it('returns 0 when yesterday was not checked (no gap found)', () => {
    const getRecord = () => ({ checked: false })
    expect(findStreakBeforeBreak(getRecord, 'h1', '2026-05-26')).toBe(0)
  })
})

/* ───────── getMilestoneBonus ───────── */

describe('getMilestoneBonus', () => {
  it('returns 0 when no milestone crossed', () => {
    expect(getMilestoneBonus(1, 0)).toBe(0)
    expect(getMilestoneBonus(2, 1)).toBe(0)
    expect(getMilestoneBonus(4, 3)).toBe(0) // already passed 3
  })

  it('returns 5 at day 3', () => {
    expect(getMilestoneBonus(3, 2)).toBe(5)
  })

  it('returns 15 at day 7', () => {
    expect(getMilestoneBonus(7, 6)).toBe(15)
  })

  it('returns 30 at day 14', () => {
    expect(getMilestoneBonus(14, 13)).toBe(30)
  })

  it('returns 50 at day 21', () => {
    expect(getMilestoneBonus(21, 20)).toBe(50)
  })

  it('returns 88 at day 30', () => {
    expect(getMilestoneBonus(30, 29)).toBe(88)
  })

  it('returns 168 at day 60', () => {
    expect(getMilestoneBonus(60, 59)).toBe(168)
  })

  it('returns 388 at day 100', () => {
    expect(getMilestoneBonus(100, 99)).toBe(388)
  })

  it('returns 688 at day 180', () => {
    expect(getMilestoneBonus(180, 179)).toBe(688)
  })

  it('returns 1688 at day 365', () => {
    expect(getMilestoneBonus(365, 364)).toBe(1688)
  })

  it('returns 0 when jumping past milestone without crossing boundary', () => {
    // prevStreak already past 3, newStreak is 5 - should NOT re-award day 3
    expect(getMilestoneBonus(5, 4)).toBe(0)
  })
})

/* ───────── getStreakBreakPenalty ───────── */

describe('getStreakBreakPenalty', () => {
  it('returns 0 for streak < 7', () => {
    expect(getStreakBreakPenalty(0)).toBe(0)
    expect(getStreakBreakPenalty(3)).toBe(0)
    expect(getStreakBreakPenalty(6)).toBe(0)
  })

  it('returns 5 for streak 7-29', () => {
    expect(getStreakBreakPenalty(7)).toBe(5)
    expect(getStreakBreakPenalty(15)).toBe(5)
    expect(getStreakBreakPenalty(29)).toBe(5)
  })

  it('returns 15 for streak 30-49', () => {
    expect(getStreakBreakPenalty(30)).toBe(15)
    expect(getStreakBreakPenalty(49)).toBe(15)
  })

  it('returns 30 for streak >= 50', () => {
    expect(getStreakBreakPenalty(50)).toBe(30)
    expect(getStreakBreakPenalty(100)).toBe(30)
    expect(getStreakBreakPenalty(365)).toBe(30)
  })
})

/* ───────── goldRules ───────── */

describe('createLedgerEntry', () => {
  it('creates entry with all required fields', () => {
    const entry = createLedgerEntry({
      type: LEDGER_ENTRY_TYPES.CHECK_IN,
      amount: 3,
      balanceAfter: 13,
      reason: '打卡奖励'
    })
    expect(entry.id).toBeTruthy()
    expect(entry.type).toBe('check_in')
    expect(entry.amount).toBe(3)
    expect(entry.balanceAfter).toBe(13)
    expect(entry.reason).toBe('打卡奖励')
    expect(entry.createdAt).toBeTruthy()
  })

  it('includes meta when provided', () => {
    const entry = createLedgerEntry({
      type: LEDGER_ENTRY_TYPES.STREAK_BONUS,
      amount: 15,
      balanceAfter: 28,
      reason: '连续奖励',
      meta: { days: 7 }
    })
    expect(entry.meta).toEqual({ days: 7 })
  })

  it('defaults meta to empty object', () => {
    const entry = createLedgerEntry({
      type: LEDGER_ENTRY_TYPES.REDEEM,
      amount: -10,
      balanceAfter: 5,
      reason: '兑换'
    })
    expect(entry.meta).toEqual({})
  })

  it('LEDGER_ENTRY_TYPES has all expected values', () => {
    expect(LEDGER_ENTRY_TYPES.CHECK_IN).toBe('check_in')
    expect(LEDGER_ENTRY_TYPES.STREAK_BONUS).toBe('streak_bonus')
    expect(LEDGER_ENTRY_TYPES.ALL_CLEAR_BONUS).toBe('all_clear_bonus')
    expect(LEDGER_ENTRY_TYPES.MAKEUP).toBe('makeup')
    expect(LEDGER_ENTRY_TYPES.PENALTY).toBe('penalty')
    expect(LEDGER_ENTRY_TYPES.REDEEM).toBe('redeem')
  })
})
