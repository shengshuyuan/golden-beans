/**
 * Schema migrations for unified app state.
 *
 * Each migration receives the previous state and returns the updated state.
 * Migrations are idempotent and must not mutate the input.
 *
 * To add a new migration:
 *   1. Add entry `N: state => ({ ...state, schemaVersion: N, ... })`
 *   2. Bump CURRENT_SCHEMA_VERSION in appStorage.js
 */

export const CURRENT_SCHEMA_VERSION = 2

export const migrations = {
  // v1 → v2: ensure analyticsEvents and settings exist
  2: (state) => ({
    ...state,
    schemaVersion: 2,
    analyticsEvents: state.analyticsEvents || [],
    settings: {
      hasCompletedOnboarding: false,
      ...(state.settings || {})
    }
  })
}

/**
 * Bring any raw state up to CURRENT_SCHEMA_VERSION.
 * Handles missing fields, wrong types, and sequential migrations.
 */
export function migrateState(rawState) {
  let state = normalizeState(rawState)

  while (state.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const nextVersion = state.schemaVersion + 1
    const migration = migrations[nextVersion]
    if (!migration) {
      state.schemaVersion = CURRENT_SCHEMA_VERSION
      break
    }
    state = migration(state)
  }

  return normalizeState(state)
}

/**
 * Ensure all expected fields exist with correct types.
 * Does NOT bump schemaVersion — that's the caller's job.
 */
export function normalizeState(state) {
  const now = new Date().toISOString()
  return {
    schemaVersion: typeof state?.schemaVersion === 'number' ? state.schemaVersion : 1,
    user: {
      gold: typeof state?.user?.gold === 'number' ? state.user.gold : 0,
      createdAt: state?.user?.createdAt || now,
      lastActiveAt: state?.user?.lastActiveAt || now
    },
    habits: Array.isArray(state?.habits) ? state.habits : [],
    checkRecords: (state?.checkRecords && typeof state.checkRecords === 'object') ? state.checkRecords : {},
    rewards: Array.isArray(state?.rewards) ? state.rewards : [],
    rewardRecords: Array.isArray(state?.rewardRecords) ? state.rewardRecords : [],
    goldLedger: Array.isArray(state?.goldLedger) ? state.goldLedger : [],
    analyticsEvents: Array.isArray(state?.analyticsEvents) ? state.analyticsEvents : [],
    settings: {
      hasCompletedOnboarding: Boolean(state?.settings?.hasCompletedOnboarding)
    }
  }
}
