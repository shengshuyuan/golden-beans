export function getTodayString(input = new Date()) {
  const date = new Date(input)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftDate(input, offset) {
  const date = new Date(input)
  date.setDate(date.getDate() + offset)
  return date
}

export function getCalendarData(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const cells = []

  for (let index = startOffset; index > 0; index -= 1) {
    const date = new Date(year, month, 1 - index)
    cells.push({
      day: date.getDate(),
      date: getTodayString(date),
      isCurrentMonth: false
    })
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day)
    cells.push({
      day,
      date: getTodayString(date),
      isCurrentMonth: true
    })
  }

  const tail = (7 - (cells.length % 7)) % 7
  for (let index = 1; index <= tail; index += 1) {
    const date = new Date(year, month + 1, index)
    cells.push({
      day: date.getDate(),
      date: getTodayString(date),
      isCurrentMonth: false
    })
  }

  return cells
}
