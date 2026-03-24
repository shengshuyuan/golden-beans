// 日期工具函数

/**
 * 获取日期字符串
 * @param {Date|string} date 日期对象或字符串，默认为今天
 * @param {string} format 格式，默认 'YYYY-MM-DD'
 * @returns {string}
 */
export function getTodayString(date = new Date(), format = 'YYYY-MM-DD') {
  const d = typeof date === 'string' ? new Date(date) : date

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`
  }

  if (format === 'YYYY/MM/DD') {
    return `${year}/${month}/${day}`
  }

  if (format === 'MM-DD') {
    return `${month}-${day}`
  }

  return `${year}-${month}-${day}`
}

/**
 * 判断是否是昨天
 * @param {string} dateString 日期字符串 'YYYY-MM-DD'
 * @returns {boolean}
 */
export function isYesterday(dateString) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateString === getTodayString(yesterday)
}

/**
 * 判断是否是今天
 * @param {string} dateString 日期字符串 'YYYY-MM-DD'
 * @returns {boolean}
 */
export function isToday(dateString) {
  return dateString === getTodayString()
}

/**
 * 获取两个日期之间的天数差
 * @param {string} date1
 * @param {string} date2
 * @returns {number}
 */
export function getDateDiff(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2 - d1)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 获取月份的天数
 * @param {number} year
 * @param {number} month 0-11
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * 获取月份第一天是星期几
 * @param {number} year
 * @param {number} month 0-11
 * @returns {number} 0-6 (0=周一)
 */
export function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

/**
 * 获取日历数据
 * @param {number} year
 * @param {number} month 0-11
 * @returns {Array} 日历数组，每个元素为 { date: 'YYYY-MM-DD', day: 1-31, isCurrentMonth: boolean }
 */
export function getCalendarData(year, month) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const calendar = []

  // 上个月的日期
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = getTodayString(new Date(prevYear, prevMonth, day))
    calendar.push({ date, day, isCurrentMonth: false })
  }

  // 当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = getTodayString(new Date(year, month, day))
    calendar.push({ date, day, isCurrentMonth: true })
  }

  // 下个月的日期
  const totalCells = 42 // 6行 x 7列
  const remainingCells = totalCells - calendar.length
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year

  for (let day = 1; day <= remainingCells; day++) {
    const date = getTodayString(new Date(nextYear, nextMonth, day))
    calendar.push({ date, day, isCurrentMonth: false })
  }

  return calendar
}

/**
 * 格式化时间
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatTime(date) {
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 格式化日期时间
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatDateTime(date) {
  const d = new Date(date)
  return `${getTodayString(d)} ${formatTime(d)}`
}

/**
 * 获取相对时间描述
 * @param {Date|string|number} date
 * @returns {string}
 */
export function getRelativeTime(date) {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return getTodayString(d)
}

/**
 * 获取月份名称
 * @param {number} month 0-11
 * @returns {string}
 */
export function getMonthName(month) {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月',
                  '七月', '八月', '九月', '十月', '十一月', '十二月']
  return months[month]
}

/**
 * 获取星期名称
 * @param {number} day 0-6
 * @param {boolean} short 是否简写
 * @returns {string}
 */
export function getWeekdayName(day, short = false) {
  const weekdays = short
    ? ['一', '二', '三', '四', '五', '六', '日']
    : ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return weekdays[day]
}
