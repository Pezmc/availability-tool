export function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

export function formatDayLabel(date: Date): string {
  const day = date.getDate()
  const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' })
  return `${dayName} ${day}${getOrdinalSuffix(day)}`
}

export function formatCompactLabel(date: Date): string {
  const day = date.getDate()
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' })
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  return `${weekday} ${day} ${month}`
}

export function todayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function generateDateRange(startDate: string, days: number): string[] {
  const dates: string[] = []
  const start = parseLocalDate(startDate)
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return dates
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Returns which week a date falls in relative to today.
 * 0 = this week (today through Sunday), 1 = next week, 2 = week after, etc.
 * Week starts on Monday.
 */
export function weekOffset(dateStr: string, todayStr?: string): number {
  const date = parseLocalDate(dateStr)
  const today = todayStr ? parseLocalDate(todayStr) : new Date()

  // Get Monday of today's week
  const todayDay = today.getDay() // 0=Sun, 1=Mon, ...
  const mondayOffset = todayDay === 0 ? -6 : 1 - todayDay
  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() + mondayOffset)
  thisMonday.setHours(0, 0, 0, 0)

  // Get Monday of the date's week
  const dateDay = date.getDay()
  const dateMondayOffset = dateDay === 0 ? -6 : 1 - dateDay
  const dateMonday = new Date(date)
  dateMonday.setDate(date.getDate() + dateMondayOffset)
  dateMonday.setHours(0, 0, 0, 0)

  const diffDays = Math.round((dateMonday.getTime() - thisMonday.getTime()) / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7)
}
