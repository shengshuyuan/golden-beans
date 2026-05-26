export const HABIT_TYPE_CONFIG = {
  easy: {
    name: '简单',
    color: '#ffb44a',
    gold: 3,
    icon: '✨'
  },
  effort: {
    name: '努力',
    color: '#ff8b5e',
    gold: 5,
    icon: '💪'
  },
  challenge: {
    name: '挑战',
    color: '#8c80ff',
    gold: 10,
    icon: '🏆'
  }
}

export const STREAK_REWARD_TIERS = [
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

export function getMilestoneBonus(newStreak, prevStreak) {
  const tier = STREAK_REWARD_TIERS.find(t => prevStreak < t.days && newStreak >= t.days)
  return tier ? tier.bonus : 0
}

export function getStreakTierName(newStreak, prevStreak) {
  const tier = STREAK_REWARD_TIERS.find(t => prevStreak < t.days && newStreak >= t.days)
  return tier ? `${tier.days}天` : ''
}

export function getStreakBreakPenalty(streakBeforeBreak) {
  if (streakBeforeBreak >= 50) return 30
  if (streakBeforeBreak >= 30) return 15
  if (streakBeforeBreak >= 7) return 5
  return 0
}

export const HABIT_ICON_OPTIONS = [
  '😴', '🏃', '📚', '✍️', '💻', '🧠',
  '🧘', '💧', '🥗', '🚶', '🧹', '🎵',
  '🗣️', '🪥', '🌅', '💰', '📝', '🏋️'
]
