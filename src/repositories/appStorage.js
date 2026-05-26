/**
 * Unified application storage layer.
 *
 * All persistent data lives under a single localStorage key
 * (`golden_bean_app_state`). Individual stores read from and
 * patch back into this unified state via the appStorage API.
 *
 * @module repositories/appStorage
 */

import { migrateState, normalizeState, CURRENT_SCHEMA_VERSION } from './migrations'

const APP_STORAGE_KEY = 'golden_bean_app_state'

// ── helpers ──────────────────────────────────────────────

function createDefaultState() {
  return normalizeState({ schemaVersion: CURRENT_SCHEMA_VERSION })
}

/**
 * Read raw JSON from localStorage. Returns null if missing or corrupt.
 */
function readRaw(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── legacy migration ────────────────────────────────────

/**
 * Build a v1 state from the old per-store localStorage keys.
 * Called once when no unified state exists yet.
 */
function loadLegacyState() {
  const readLegacy = (key, fallback) => readRaw(key) ?? fallback
  return normalizeState({
    schemaVersion: 1,
    user: {
      gold: readLegacy('habit_tracker_user_gold', 0),
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    },
    habits: readLegacy('habit_tracker_habits', []),
    checkRecords: readLegacy('habit_tracker_check_records', {}),
    rewards: readLegacy('habit_tracker_rewards', []),
    rewardRecords: readLegacy('habit_tracker_reward_records', []),
    goldLedger: readLegacy('habit_tracker_gold_ledger', []),
    analyticsEvents: readLegacy('habit_tracker_analytics_events', []),
    settings: { hasCompletedOnboarding: false }
  })
}

// ── public API ──────────────────────────────────────────

export const appStorage = {
  /**
   * Load the full application state.
   * 1. Read unified key → migrate to latest
   * 2. If missing, read legacy keys → migrate → save unified
   * 3. If everything fails, return default state
   */
  load() {
    try {
      const unified = readRaw(APP_STORAGE_KEY)
      if (unified) return migrateState(unified)
    } catch { /* fall through */ }

    // Try legacy migration
    try {
      const legacy = loadLegacyState()
      const migrated = migrateState(legacy)
      this.save(migrated)
      return migrated
    } catch { /* fall through */ }

    return createDefaultState()
  },

  /**
   * Write the full state to localStorage.
   * @returns {{ success: boolean, error?: string }}
   */
  save(state) {
    try {
      const toSave = {
        ...state,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        user: { ...state.user, lastActiveAt: new Date().toISOString() }
      }
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(toSave))
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  },

  /**
   * Read → transform → save. Atomic-ish update.
   * @param {(state: object) => object} updater
   * @returns {{ success: boolean, state?: object, error?: string }}
   */
  patch(updater) {
    try {
      const current = this.load()
      const next = updater(current)
      const result = this.save(next)
      return { ...result, state: next }
    } catch (e) {
      return { success: false, error: e.message }
    }
  },

  /**
   * Reset to default state and clear legacy keys.
   */
  reset() {
    try {
      localStorage.removeItem(APP_STORAGE_KEY)
      // Also clean legacy keys
      const legacyKeys = [
        'habit_tracker_user_gold',
        'habit_tracker_gold_ledger',
        'habit_tracker_habits',
        'habit_tracker_check_records',
        'habit_tracker_rewards',
        'habit_tracker_reward_records',
        'habit_tracker_analytics_events',
        'habit_tracker_storage_version'
      ]
      legacyKeys.forEach(k => localStorage.removeItem(k))
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  },

  /**
   * Export the full state as a JSON string for backup.
   */
  exportJson() {
    const state = this.load()
    return JSON.stringify(
      {
        appName: 'golden-bean',
        exportedAt: new Date().toISOString(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        state
      },
      null,
      2
    )
  },

  /**
   * Import a JSON string, validate, migrate, and save.
   * @param {string} json
   * @returns {{ success: boolean, state?: object, error?: string }}
   */
  importJson(json) {
    try {
      const data = JSON.parse(json)

      // Validate app identity
      if (data.appName !== 'golden-bean') {
        // Try to detect raw state (has habits/goldLedger but no appName)
        if (!data.habits && !data.goldLedger) {
          return { success: false, error: '这不是金豆习惯的备份文件' }
        }
      }

      const rawState = data.state || data
      const migrated = migrateState(rawState)
      const result = this.save(migrated)

      return { ...result, state: migrated }
    } catch {
      return { success: false, error: '备份文件格式无效' }
    }
  },

  /** Expose the key for testing */
  APP_STORAGE_KEY,

  /** Expose default state for testing */
  createDefaultState
}
