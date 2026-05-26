import { storage } from './storage'

const STORAGE_VERSION_KEY = 'storage_version'
const CURRENT_VERSION = 1

const migrations = [
  {
    from: 0,
    to: 1,
    migrate() {
      // v0 → v1: Add type/balanceAfter to existing ledger entries
      const ledger = storage.get('gold_ledger', [])
      if (ledger.length > 0) {
        let balance = 0
        const migrated = ledger.map(entry => {
          if (entry.type) return entry // already migrated
          balance += entry.amount
          return {
            ...entry,
            type: entry.amount > 0 ? 'check_in' : 'redeem',
            balanceAfter: balance
          }
        })
        storage.set('gold_ledger', migrated)
      }
    }
  }
]

export function runMigrations() {
  const currentVersion = storage.get(STORAGE_VERSION_KEY, 0)
  if (currentVersion >= CURRENT_VERSION) return

  const pending = migrations.filter(m => m.from >= currentVersion)
  for (const migration of pending) {
    migration.migrate()
  }

  storage.set(STORAGE_VERSION_KEY, CURRENT_VERSION)
}

export { CURRENT_VERSION }
