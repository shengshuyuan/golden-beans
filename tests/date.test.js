import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTodayString, shiftDate, getCalendarData } from '../src/utils/date'

describe('getTodayString', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = getTodayString(new Date(2026, 0, 15))
    expect(result).toBe('2026-01-15')
  })

  it('pads single digit month and day', () => {
    const result = getTodayString(new Date(2026, 2, 5))
    expect(result).toBe('2026-03-05')
  })

  it('defaults to current date when no input', () => {
    const result = getTodayString()
    const today = new Date()
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(result).toBe(expected)
  })

  it('handles date string input', () => {
    const result = getTodayString('2026-06-01')
    expect(result).toBe('2026-06-01')
  })
})

describe('shiftDate', () => {
  it('adds days', () => {
    const result = shiftDate(new Date(2026, 0, 15), 3)
    expect(result.getDate()).toBe(18)
  })

  it('subtracts days', () => {
    const result = shiftDate(new Date(2026, 0, 15), -5)
    expect(result.getDate()).toBe(10)
  })

  it('handles month boundary', () => {
    const result = shiftDate(new Date(2026, 0, 1), -1)
    expect(result.getMonth()).toBe(11) // December
    expect(result.getDate()).toBe(31)
  })

  it('handles year boundary', () => {
    const result = shiftDate(new Date(2026, 11, 31), 1)
    expect(result.getMonth()).toBe(0) // January
    expect(result.getDate()).toBe(1)
  })
})

describe('getCalendarData', () => {
  it('returns cells that are a multiple of 7', () => {
    const cells = getCalendarData(2026, 0) // January 2026
    expect(cells.length % 7).toBe(0)
  })

  it('marks current month days correctly', () => {
    const cells = getCalendarData(2026, 5) // June 2026
    const currentMonthDays = cells.filter(c => c.isCurrentMonth)
    expect(currentMonthDays).toHaveLength(30) // June has 30 days
  })

  it('each cell has day, date, isCurrentMonth', () => {
    const cells = getCalendarData(2026, 0)
    cells.forEach(cell => {
      expect(cell).toHaveProperty('day')
      expect(cell).toHaveProperty('date')
      expect(cell).toHaveProperty('isCurrentMonth')
    })
  })

  it('all date strings are valid YYYY-MM-DD', () => {
    const cells = getCalendarData(2026, 0)
    cells.forEach(cell => {
      expect(cell.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
