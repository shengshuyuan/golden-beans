// 本地存储工具

const STORAGE_PREFIX = 'habit_tracker_'

export const storage = {
  // 获取数据
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  },

  // 设置数据
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      return false
    }
  },

  // 删除数据
  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  },

  // 清空所有数据
  clear() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  },

  // 导出所有数据
  exportAll() {
    const data = {}
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const actualKey = key.replace(STORAGE_PREFIX, '')
        data[actualKey] = this.get(actualKey)
      }
    })
    return data
  },

  // 导入数据
  importAll(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value)
    })
  }
}

export default storage
