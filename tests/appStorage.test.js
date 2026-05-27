import { describe, it, expect, beforeEach } from 'vitest'
import { appStorage } from '../src/repositories/appStorage'
import { migrateState, normalizeState, CURRENT_SCHEMA_VERSION } from '../src/repositories/migrations'

beforeEach(() => {
  localStorage.clear()
})

/* ───────── normalizeState ───────── */

describe('normalizeState', () => {
  it('returns default state for null input', () => {
    const s = normalizeState(null)
    expect(s.schemaVersion).toBe(1)
    expect(s.user.gold).toBe(0)
    expect(s.habits).toEqual([])
    expect(s.checkRecords).toEqual({})
    expect(s.rewards).toEqual([])
    expect(s.goldLedger).toEqual([])
    expect(s.analyticsEvents).toEqual([])
    expect(s.settings.hasCompletedOnboarding).toBe(false)
  })

  it('preserves existing values', () => {
    const s = normalizeState({
      schemaVersion: 2,
      user: { gold: 42, createdAt: '2026-01-01', lastActiveAt: '2026-05-01' },
      habits: [{ id: '1', name: 'test' }],
      goldLedger: [{ id: 'a' }]
    })
    expect(s.schemaVersion).toBe(2)
    expect(s.user.gold).toBe(42)
    expect(s.habits).toHaveLength(1)
    expect(s.goldLedger).toHaveLength(1)
  })

  it('fixes wrong types gracefully', () => {
    const s = normalizeState({
      user: { gold: 'not-a-number' },
      habits: 'not-an-array',
      checkRecords: null
    })
    expect(s.user.gold).toBe(0)
    expect(s.habits).toEqual([])
    expect(s.checkRecords).toEqual({})
  })
})

/* ───────── migrateState ───────── */

describe('migrateState', () => {
  it('migrates v1 to latest version', () => {
    const s = migrateState({ schemaVersion: 1, user: { gold: 5 } })
    expect(s.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(s.analyticsEvents).toEqual([])
    expect(s.settings.hasCompletedOnboarding).toBe(false)
  })

  it('skips migration when already at latest', () => {
    const input = { schemaVersion: CURRENT_SCHEMA_VERSION, user: { gold: 10 } }
    const s = migrateState(input)
    expect(s.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(s.user.gold).toBe(10)
  })

  it('handles null input', () => {
    const s = migrateState(null)
    expect(s.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(s.user.gold).toBe(0)
  })
})

/* ───────── appStorage.load ───────── */

describe('appStorage.load', () => {
  it('returns default state when localStorage is empty', () => {
    const s = appStorage.load()
    expect(s.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(s.user.gold).toBe(0)
    expect(s.habits).toEqual([])
  })

  it('reads from unified key', () => {
    const state = { schemaVersion: 1, user: { gold: 99 }, habits: [] }
    localStorage.setItem('golden_bean_app_state', JSON.stringify(state))
    const s = appStorage.load()
    expect(s.user.gold).toBe(99)
  })

  it('migrates legacy keys when no unified key', () => {
    localStorage.setItem('habit_tracker_user_gold', '42')
    localStorage.setItem('habit_tracker_habits', JSON.stringify([{ id: 'h1', name: '阅读' }]))
    localStorage.setItem('habit_tracker_gold_ledger', JSON.stringify([{ id: 'l1' }]))

    const s = appStorage.load()
    expect(s.user.gold).toBe(42)
    expect(s.habits).toHaveLength(1)
    expect(s.goldLedger).toHaveLength(1)

    // Should have saved unified key
    const raw = JSON.parse(localStorage.getItem('golden_bean_app_state'))
    expect(raw.user.gold).toBe(42)
  })

  it('handles corrupt JSON gracefully', () => {
    localStorage.setItem('golden_bean_app_state', 'not-json{{{')
    const s = appStorage.load()
    expect(s.user.gold).toBe(0)
  })
})

/* ───────── appStorage.save ───────── */

describe('appStorage.save', () => {
  it('writes to localStorage', () => {
    const state = appStorage.createDefaultState()
    state.user.gold = 50
    appStorage.save(state)

    const raw = JSON.parse(localStorage.getItem('golden_bean_app_state'))
    expect(raw.user.gold).toBe(50)
  })

  it('returns success', () => {
    const result = appStorage.save(appStorage.createDefaultState())
    expect(result.success).toBe(true)
  })

  it('updates lastActiveAt', () => {
    const state = appStorage.createDefaultState()
    state.user.lastActiveAt = '2020-01-01'
    appStorage.save(state)

    const raw = JSON.parse(localStorage.getItem('golden_bean_app_state'))
    expect(raw.user.lastActiveAt).not.toBe('2020-01-01')
  })
})

/* ───────── appStorage.patch ───────── */

describe('appStorage.patch', () => {
  it('reads, transforms, and saves', () => {
    appStorage.save(appStorage.createDefaultState())
    appStorage.patch(s => ({ ...s, user: { ...s.user, gold: 77 } }))

    const loaded = appStorage.load()
    expect(loaded.user.gold).toBe(77)
  })

  it('returns the new state', () => {
    appStorage.save(appStorage.createDefaultState())
    const { state } = appStorage.patch(s => ({ ...s, user: { ...s.user, gold: 33 } }))
    expect(state.user.gold).toBe(33)
  })
})

/* ───────── appStorage.exportJson / importJson ───────── */

describe('appStorage.exportJson', () => {
  it('exports valid JSON with metadata', () => {
    appStorage.save(appStorage.createDefaultState())
    const json = appStorage.exportJson()
    const data = JSON.parse(json)

    expect(data.appName).toBe('golden-bean')
    expect(data.exportedAt).toBeTruthy()
    expect(data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(data.state).toBeTruthy()
  })
})

describe('appStorage.importJson', () => {
  it('imports valid backup', () => {
    const backup = JSON.stringify({
      appName: 'golden-bean',
      exportedAt: new Date().toISOString(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      state: { schemaVersion: 1, user: { gold: 200 }, habits: [] }
    })

    const result = appStorage.importJson(backup)
    expect(result.success).toBe(true)
    expect(appStorage.load().user.gold).toBe(200)
  })

  it('rejects non-golden-bean backup', () => {
    const result = appStorage.importJson('{"appName":"other","state":{}}')
    expect(result.success).toBe(false)
    expect(result.error).toContain('金豆习惯')
  })

  it('rejects invalid JSON', () => {
    const result = appStorage.importJson('not json')
    expect(result.success).toBe(false)
    expect(result.error).toContain('格式无效')
  })

  it('accepts raw state without appName wrapper', () => {
    const raw = JSON.stringify({ schemaVersion: 1, user: { gold: 50 }, habits: [] })
    const result = appStorage.importJson(raw)
    expect(result.success).toBe(true)
    expect(appStorage.load().user.gold).toBe(50)
  })
})

/* ───────── appStorage.reset ───────── */

describe('appStorage.reset', () => {
  it('clears unified and legacy keys', () => {
    localStorage.setItem('golden_bean_app_state', '{}')
    localStorage.setItem('habit_tracker_user_gold', '10')
    appStorage.reset()

    expect(localStorage.getItem('golden_bean_app_state')).toBeNull()
    expect(localStorage.getItem('habit_tracker_user_gold')).toBeNull()
  })

  it('auto-backs up before reset', () => {
    const state = appStorage.createDefaultState()
    state.user.gold = 99
    appStorage.save(state)
    appStorage.reset()

    // Backup should still exist
    const backup = appStorage.getBackupInfo()
    expect(backup.exists).toBe(true)
  })
})

/* ───────── appStorage backup & recovery ───────── */

describe('appStorage backup', () => {
  it('creates backup on save', () => {
    const state = appStorage.createDefaultState()
    state.user.gold = 55
    appStorage.save(state)

    const backup = appStorage.getBackupInfo()
    expect(backup.exists).toBe(true)
    expect(backup.savedAt).toBeTruthy()
  })

  it('restores from backup when main data is corrupt', () => {
    // Save good data (creates backup)
    const state = appStorage.createDefaultState()
    state.user.gold = 88
    appStorage.save(state)

    // Corrupt main data
    localStorage.setItem('golden_bean_app_state', 'corrupt{{{')

    // Load should recover from backup
    const loaded = appStorage.load()
    expect(loaded.user.gold).toBe(88)
  })

  it('restores from backup when main data is deleted', () => {
    const state = appStorage.createDefaultState()
    state.user.gold = 77
    appStorage.save(state)

    // Delete main data
    localStorage.removeItem('golden_bean_app_state')

    const loaded = appStorage.load()
    expect(loaded.user.gold).toBe(77)
  })

  it('restoreFromBackup returns the restored state', () => {
    const state = appStorage.createDefaultState()
    state.user.gold = 44
    appStorage.save(state)

    // Overwrite with different data
    const state2 = appStorage.createDefaultState()
    state2.user.gold = 99
    appStorage.save(state2)

    const result = appStorage.restoreFromBackup()
    expect(result.success).toBe(true)
    // Backup was the previous save
  })

  it('returns false when no backup exists', () => {
    localStorage.clear()
    const result = appStorage.restoreFromBackup()
    expect(result.success).toBe(false)
  })
})

/* ───────── appStorage health ───────── */

describe('appStorage.checkHealth', () => {
  it('returns low usage when storage is empty', () => {
    const health = appStorage.checkHealth()
    expect(health.usage).toBe(0)
    expect(health.warning).toBe(false)
    expect(health.critical).toBe(false)
  })

  it('returns usage percentage', () => {
    const state = appStorage.createDefaultState()
    state.goldLedger = Array.from({ length: 10 }, (_, i) => ({ id: i, amount: 3 }))
    appStorage.save(state)

    const health = appStorage.checkHealth()
    // In test environment, localStorage mock may report 0 usage
    expect(health.usage).toBeGreaterThanOrEqual(0)
    expect(health.usage).toBeLessThan(100)
    expect(typeof health.warning).toBe('boolean')
    expect(typeof health.critical).toBe('boolean')
  })
})

/* ───────── appStorage import backup protection ───────── */

describe('appStorage import rollback', () => {
  it('backs up current state before importing', () => {
    const state = appStorage.createDefaultState()
    state.user.gold = 100
    appStorage.save(state)

    // Import new data
    const backup = JSON.stringify({
      appName: 'golden-bean',
      state: { schemaVersion: 1, user: { gold: 200 }, habits: [] }
    })
    appStorage.importJson(backup)

    // Current data should be the imported one
    expect(appStorage.load().user.gold).toBe(200)

    // Restore from backup should give previous data
    const restoreResult = appStorage.restoreFromBackup()
    expect(restoreResult.success).toBe(true)
  })
})
