/**
 * LEDGER_ENTRY_TYPES - Canonical types for gold bean ledger entries.
 */
export const LEDGER_ENTRY_TYPES = {
  CHECK_IN: 'check_in',
  STREAK_BONUS: 'streak_bonus',
  ALL_CLEAR_BONUS: 'all_clear_bonus',
  MAKEUP: 'makeup',
  PENALTY: 'penalty',
  REDEEM: 'redeem'
}

/**
 * Build a ledger entry object (pure function).
 * @param {object} params
 * @param {string} params.type - one of LEDGER_ENTRY_TYPES
 * @param {number} params.amount - positive for income, negative for expense
 * @param {number} params.balanceAfter - balance after this entry
 * @param {string} params.reason - human-readable reason
 * @param {object} params.meta - additional metadata
 * @returns {object} ledger entry
 */
export function createLedgerEntry({ type, amount, balanceAfter, reason, meta = {} }) {
  return {
    id: crypto.randomUUID(),
    type,
    amount,
    balanceAfter,
    reason,
    meta,
    createdAt: new Date().toISOString()
  }
}
