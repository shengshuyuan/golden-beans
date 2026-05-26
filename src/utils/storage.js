const STORAGE_PREFIX = 'habit_tracker_'

export const storage = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key)
      return raw ? JSON.parse(raw) : defaultValue
    } catch (error) {
      console.error(`read ${key} failed`, error)
      return defaultValue
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`write ${key} failed`, error)
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return true
    } catch (error) {
      console.error(`remove ${key} failed`, error)
      return false
    }
  }
}

export default storage
