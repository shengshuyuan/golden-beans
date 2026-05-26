import { describe, it, expect } from 'vitest'
import {
  HABIT_TYPE_CONFIG,
  STREAK_REWARD_TIERS,
  getMilestoneBonus,
  getStreakTierName,
  getStreakBreakPenalty,
  HABIT_ICON_OPTIONS
} from '../src/config/habitConstants'

describe('HABIT_TYPE_CONFIG', () => {
  it('easy type gives 3 gold', () => {
    expect(HABIT_TYPE_CONFIG.easy.gold).toBe(3)
  })

  it('effort type gives 5 gold', () => {
    expect(HABIT_TYPE_CONFIG.effort.gold).toBe(5)
  })

  it('challenge type gives 10 gold', () => {
    expect(HABIT_TYPE_CONFIG.challenge.gold).toBe(10)
  })
})

describe('STREAK_REWARD_TIERS', () => {
  it('has all 9 milestone tiers', () => {
    expect(STREAK_REWARD_TIERS).toHaveLength(9)
  })

  it('tiers are in ascending day order', () => {
    for (let i = 1; i < STREAK_REWARD_TIERS.length; i++) {
      expect(STREAK_REWARD_TIERS[i].days).toBeGreaterThan(STREAK_REWARD_TIERS[i - 1].days)
    }
  })

  it('matches PRD values', () => {
    const expected = [
      { days: 3, bonus: 5 },
      { days: 7, bonus: 15 },
      { days: 14, bonus: 30 },
      { days: 21, bonus: 50 },
      { days: 30, bonus: 88 },
      { days: 60, bonus: 168 },
      { days: 100, bonus: 388 },
      { days: 180, bonus: 688 },
      { days: 365, bonus: 1688 }
    ]
    expect(STREAK_REWARD_TIERS).toEqual(expected)
  })
})

describe('getMilestoneBonus', () => {
  it('returns 0 for no milestone', () => {
    expect(getMilestoneBonus(2, 1)).toBe(0)
  })

  it('returns 5 at day 3 milestone', () => {
    expect(getMilestoneBonus(3, 2)).toBe(5)
  })

  it('returns 15 at day 7 milestone', () => {
    expect(getMilestoneBonus(7, 6)).toBe(15)
  })

  it('returns 88 at day 30 milestone', () => {
    expect(getMilestoneBonus(30, 29)).toBe(88)
  })

  it('returns 1688 at day 365 milestone', () => {
    expect(getMilestoneBonus(365, 364)).toBe(1688)
  })

  it('returns 0 when already past milestone', () => {
    expect(getMilestoneBonus(8, 7)).toBe(0)
  })

  it('returns 0 when streak is below first tier', () => {
    expect(getMilestoneBonus(1, 0)).toBe(0)
  })
})

describe('getStreakTierName', () => {
  it('returns tier name on milestone', () => {
    expect(getStreakTierName(7, 6)).toBe('7天')
  })

  it('returns empty when no milestone hit', () => {
    expect(getStreakTierName(5, 4)).toBe('')
  })
})

describe('getStreakBreakPenalty', () => {
  it('returns 0 for streak < 7', () => {
    expect(getStreakBreakPenalty(5)).toBe(0)
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

describe('HABIT_ICON_OPTIONS', () => {
  it('has icons available', () => {
    expect(HABIT_ICON_OPTIONS.length).toBeGreaterThan(0)
  })

  it('all entries are strings', () => {
    HABIT_ICON_OPTIONS.forEach(icon => {
      expect(typeof icon).toBe('string')
    })
  })
})
