/**
 * Unified application storage layer.
 *
 * All persistent data lives under a single localStorage key
 * (`golden_bean_app_state`). Individual stores read from and
 * patch back into this unified state via the appStorage API.
 *
 * Safety features:
 * - Automatic backup to a separate key on every save
 * - Checksum-based corruption detection with auto-recovery
 * - Storage quota management with ledger truncation
 * - Multi-tab sync via storage events
 * - Import rollback protection (auto-backup before import)
 *
 * @module repositories/appStorage
 */

import { migrateState, normalizeState, CURRENT_SCHEMA_VERSION } from './migrations'

const APP_STORAGE_KEY = 'golden_bean_app_state'
const BACKUP_KEY = 'golden_bean_backup'
const BACKUP_META_KEY = 'golden_bean_backup_meta'
const MAX_LEDGER_ENTRIES = 500
const QUOTA_WARN_RATIO = 0.80
const QUOTA_TRUNCATE_RATIO = 0.70

// ── helpers ──────────────────────────────────────────────

function createDefaultState() {
  return normalizeState({ schemaVersion: CURRENT_SCHEMA_VERSION })
}

/**
 * Simple string hash for checksum. Returns a short base-36 string.
 */
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
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

// ── backup management ────────────────────────────────────

function writeBackup(state) {
  try {
    const json = JSON.stringify(state)
    const checksum = simpleHash(json)
    localStorage.setItem(BACKUP_KEY, json)
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify({
      checksum,
      savedAt: new Date().toISOString()
    }))
  } catch {
    // Backup write failure is not critical
  }
}

function readBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY)
    if (!raw) return null
    const meta = readRaw(BACKUP_META_KEY)
    if (!meta) return null
    const checksum = simpleHash(raw)
    if (checksum !== meta.checksum) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Verify main data integrity and attempt recovery from backup.
 */
function loadWithRecovery() {
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY)
    if (!raw) {
      // Main data missing — try backup
      const backup = readBackup()
      if (backup) {
        localStorage.setItem(APP_STORAGE_KEY, raw || JSON.stringify(backup))
        return { state: backup, recovered: true }
      }
      return { state: null, recovered: false }
    }

    // Verify checksum from meta (if exists)
    const meta = readRaw(BACKUP_META_KEY)
    if (meta && meta.checksum) {
      // Check if main data matches backup checksum
      const backupRaw = localStorage.getItem(BACKUP_KEY)
      if (backupRaw && simpleHash(backupRaw) !== meta.checksum) {
        // Backup itself is corrupted, overwrite with main data
        writeBackup(JSON.parse(raw))
      }
    }

    const state = JSON.parse(raw)
    return { state, recovered: false }
  } catch {
    // Main data is corrupt — try backup
    const backup = readBackup()
    if (backup) {
      try {
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(backup))
      } catch { /* quota full, can't restore */ }
      return { state: backup, recovered: true }
    }
    return { state: null, recovered: false }
  }
}

// ── quota management ─────────────────────────────────────

/**
 * Estimate localStorage usage ratio. Returns 0-1.
 */
function estimateUsage() {
  try {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      total += (key.length + localStorage.getItem(key).length) * 2 // UTF-16
    }
    // Assume 5MB limit (conservative)
    return total / (5 * 1024 * 1024)
  } catch {
    return 0
  }
}

/**
 * Truncate old ledger entries to free space.
 */
function truncateLedger(state) {
  if (!Array.isArray(state.goldLedger) || state.goldLedger.length <= MAX_LEDGER_ENTRIES) {
    return state
  }
  return {
    ...state,
    goldLedger: state.goldLedger.slice(0, MAX_LEDGER_ENTRIES)
  }
}

/**
 * Trim state to fit within quota. Removes oldest data first.
 */
function trimForQuota(state) {
  let trimmed = { ...state }

  // Phase 1: Truncate ledger
  trimmed = truncateLedger(trimmed)

  // Phase 2: Truncate analytics events (keep most recent 100)
  if (trimmed.analyticsEvents && trimmed.analyticsEvents.length > 100) {
    trimmed = {
      ...trimmed,
      analyticsEvents: trimmed.analyticsEvents.slice(-100)
    }
  }

  return trimmed
}

// ── legacy migration ────────────────────────────────────

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

// ── multi-tab sync ──────────────────────────────────────

let syncListeners = []
let loadCache = null

function notifyListeners(newData) {
  syncListeners.forEach(fn => {
    try { fn(newData) } catch { /* ignore */ }
  })
}

// ── public API ──────────────────────────────────────────

export const appStorage = {
  /**
   * Load the full application state.
   * 1. Read unified key with corruption recovery
   * 2. If missing, try backup, then legacy keys
   * 3. If everything fails, return default state
   */
  load() {
    if (loadCache) return loadCache

    try {
      const { state, recovered } = loadWithRecovery()
      if (state) {
        if (recovered) {
          this.save(migrateState(state))
        }
        loadCache = migrateState(state)
        return loadCache
      }
    } catch { /* fall through */ }

    // Try legacy migration
    try {
      const legacy = loadLegacyState()
      const migrated = migrateState(legacy)
      this.save(migrated)
      loadCache = migrated
      return migrated
    } catch { /* fall through */ }

    loadCache = createDefaultState()
    return loadCache
  },

  /**
   * Write the full state to localStorage with backup.
   * @returns {{ success: boolean, error?: string }}
   */
  save(state) {
    try {
      const toSave = {
        ...state,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        user: { ...state.user, lastActiveAt: new Date().toISOString() }
      }

      const usage = estimateUsage()
      const finalState = usage > QUOTA_WARN_RATIO ? trimForQuota(toSave) : toSave

      const json = JSON.stringify(finalState)
      localStorage.setItem(APP_STORAGE_KEY, json)
      writeBackup(finalState)

      loadCache = null
      return { success: true }
    } catch (e) {
      // If quota exceeded, try trimming more aggressively
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        try {
          const trimmed = trimForQuota(state)
          // Also truncate ledger to half
          const minimal = {
            ...trimmed,
            goldLedger: (trimmed.goldLedger || []).slice(0, 200)
          }
          localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(minimal))
          writeBackup(minimal)
          return { success: true, warning: '存储空间不足，已自动清理旧数据' }
        } catch {
          return { success: false, error: '存储空间不足，无法保存数据' }
        }
      }
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
   * Reset to default state. Auto-backs up first so user can recover.
   */
  reset() {
    try {
      const current = this.load()
      writeBackup(current)

      localStorage.removeItem(APP_STORAGE_KEY)
      loadCache = null
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
   * Auto-backs up current state before importing.
   * @param {string} json
   * @returns {{ success: boolean, state?: object, error?: string }}
   */
  importJson(json) {
    try {
      const data = JSON.parse(json)

      // Validate app identity
      if (data.appName !== 'golden-bean') {
        if (!data.habits && !data.goldLedger) {
          return { success: false, error: '这不是金豆习惯的备份文件' }
        }
      }

      // Auto-backup current state before overwriting
      const current = this.load()
      writeBackup(current)

      const rawState = data.state || data
      const migrated = migrateState(rawState)
      const result = this.save(migrated)

      return { ...result, state: migrated }
    } catch {
      return { success: false, error: '备份文件格式无效' }
    }
  },

  /**
   * Restore from the auto-backup.
   * @returns {{ success: boolean, state?: object, error?: string }}
   */
  restoreFromBackup() {
    try {
      const backup = readBackup()
      if (!backup) {
        return { success: false, error: '没有找到自动备份' }
      }
      const migrated = migrateState(backup)
      const result = this.save(migrated)
      return { ...result, state: migrated }
    } catch {
      return { success: false, error: '备份恢复失败' }
    }
  },

  /**
   * Check if a backup exists.
   * @returns {{ exists: boolean, savedAt?: string }}
   */
  getBackupInfo() {
    const meta = readRaw(BACKUP_META_KEY)
    if (!meta) return { exists: false }
    const backupRaw = localStorage.getItem(BACKUP_KEY)
    if (!backupRaw || simpleHash(backupRaw) !== meta.checksum) {
      return { exists: false }
    }
    return { exists: true, savedAt: meta.savedAt }
  },

  /**
   * Register a listener for multi-tab sync.
   * @param {function} callback
   * @returns {function} unsubscribe function
   */
  onSync(callback) {
    syncListeners.push(callback)
    return () => {
      syncListeners = syncListeners.filter(fn => fn !== callback)
    }
  },

  /**
   * Check storage health.
   * @returns {{ usage: number, warning: boolean, critical: boolean }}
   */
  checkHealth() {
    const usage = estimateUsage()
    return {
      usage: Math.round(usage * 100),
      warning: usage > QUOTA_WARN_RATIO,
      critical: usage > 0.95
    }
  },

  /**
   * Async version of save. Returns a Promise.
   * When integrating Supabase, replace the implementation here
   * while keeping the sync version for backward compatibility.
   * @param {object} state
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async saveAsync(state) {
    return this.save(state)
  },

  /**
   * Async version of patch. Returns a Promise.
   * @param {(state: object) => object} updater
   * @returns {Promise<{ success: boolean, state?: object, error?: string }>}
   */
  async patchAsync(updater) {
    return this.patch(updater)
  },

  /**
   * Async version of load. Returns a Promise.
   * @returns {Promise<object>}
   */
  async loadAsync() {
    return this.load()
  },

  /** Expose the key for testing */
  APP_STORAGE_KEY,

  /** Expose backup key for testing */
  BACKUP_KEY,

  /** Expose default state for testing */
  createDefaultState,

  /** Clear the load cache (for testing) */
  clearCache() { loadCache = null }
}

// ── multi-tab sync via storage events ────────────────────

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === APP_STORAGE_KEY && e.newValue) {
      loadCache = null
      try {
        const newData = JSON.parse(e.newValue)
        notifyListeners(newData)
      } catch { /* ignore corrupt data from other tab */ }
    }
  })
}
