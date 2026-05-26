/**
 * Calculate completion rate for a habit.
 * @param {number} checkedDays - total checked days
 * @param {string} createdAt - habit creation date ISO string
 * @returns {number} rate percentage 0-100
 */
export function calculateCompletionRate(checkedDays, createdAt) {
  const start = new Date(createdAt || Date.now())
  start.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const totalDays = Math.max(1, Math.ceil((now - start) / 86400000) + 1)
  return Math.min(100, Math.round((checkedDays / totalDays) * 100))
}

/**
 * Generate product insights from habit stats.
 * @param {Array} stats - array of { name, rate, streak, ... }
 * @returns {Array} insight objects { icon, title, text }
 */
export function generateInsights(stats) {
  if (stats.length === 0) return []

  const sorted = [...stats].sort((a, b) => b.rate - a.rate)
  const mostStable = sorted[0]
  const weakest = sorted[sorted.length - 1]
  const result = []

  if (mostStable && mostStable.rate > 0) {
    result.push({
      icon: '🏆',
      title: '最稳定习惯',
      text: `「${mostStable.name}」完成率 ${mostStable.rate}%，保持得很好`
    })
  }

  if (weakest && weakest.rate < mostStable?.rate && weakest.rate < 60) {
    result.push({
      icon: '💪',
      title: '可以加强',
      text: `「${weakest.name}」完成率 ${weakest.rate}%，试试把它拆小一点`
    })
  }

  const totalAvg = stats.reduce((sum, h) => sum + h.rate, 0) / stats.length
  if (totalAvg >= 70) {
    result.push({
      icon: '⭐',
      title: '本周建议',
      text: '整体完成率不错，可以考虑增加一个新挑战'
    })
  } else if (totalAvg < 40) {
    result.push({
      icon: '🌱',
      title: '本周建议',
      text: '先把习惯数量减少到 2-3 个，专注养成节奏'
    })
  }

  return result
}

/**
 * Get day completion status for calendar.
 * @param {string} date - YYYY-MM-DD
 * @param {Array} activeHabits - active habits array
 * @param {Function} getCheckRecord - (habitId, date) => record
 * @returns {'none' | 'partial' | 'all'}
 */
export function getDayStatus(date, activeHabits, getCheckRecord) {
  if (activeHabits.length === 0) return 'none'
  const checked = activeHabits.filter(h => getCheckRecord(h.id, date).checked).length
  if (checked === 0) return 'none'
  if (checked === activeHabits.length) return 'all'
  return 'partial'
}
