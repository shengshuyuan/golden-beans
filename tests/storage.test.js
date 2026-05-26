import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '../src/utils/storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('get returns default when key not set', () => {
    expect(storage.get('nonexistent', 42)).toBe(42)
  })

  it('get returns null default when key not set', () => {
    expect(storage.get('nonexistent')).toBeNull()
  })

  it('set and get round trips correctly', () => {
    storage.set('test_key', { value: 123 })
    expect(storage.get('test_key')).toEqual({ value: 123 })
  })

  it('stores with prefix', () => {
    storage.set('my_key', 'hello')
    expect(localStorage.getItem('habit_tracker_my_key')).toBe('"hello"')
  })

  it('remove deletes the key', () => {
    storage.set('to_delete', 'data')
    storage.remove('to_delete')
    expect(storage.get('to_delete')).toBeNull()
  })

  it('handles arrays', () => {
    const arr = [1, 2, 3]
    storage.set('arr', arr)
    expect(storage.get('arr')).toEqual(arr)
  })

  it('handles corrupt data gracefully', () => {
    localStorage.setItem('habit_tracker_bad', '{invalid json')
    expect(storage.get('bad', 'fallback')).toBe('fallback')
  })

  it('set returns true on success', () => {
    expect(storage.set('ok', 1)).toBe(true)
  })

  it('remove returns true on success', () => {
    storage.set('x', 1)
    expect(storage.remove('x')).toBe(true)
  })
})
