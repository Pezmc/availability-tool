import type { DayAvailability, SlotSelection, TimeOfDay } from '../types'
import { formatDayLabel, parseLocalDate, weekOffset, getOrdinalSuffix } from '../utils/dates'

const TIME_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening']
const STATUS_LABEL: Record<string, string> = {
  'if-need-be': 'If need be',
}

function slotLabel(slot: SlotSelection): string {
  const base = slot.timeOfDay
  const suffix = STATUS_LABEL[slot.status]
  return suffix ? `${base} - ${suffix}` : base
}

function formatDaySlots(slots: SlotSelection[]): string {
  const sorted = [...slots].sort(
    (a, b) => TIME_ORDER.indexOf(a.timeOfDay) - TIME_ORDER.indexOf(b.timeOfDay)
  )

  if (sorted.length === 3) {
    const allSameStatus = sorted.every(s => s.status === sorted[0].status)
    if (allSameStatus) {
      const suffix = STATUS_LABEL[sorted[0].status]
      return suffix ? `all day - ${suffix}` : 'all day'
    }
  }

  return sorted.map(slotLabel).join(' + ')
}

// Week-aware day label for list/chat formats
// Week 0: "Wednesday" (no date)
// Week 1: "Wednesday" (grouped under "Next week:")
// Week 2+: "Wednesday 17th" (with date number)
function weekAwareDayLabel(date: Date, week: number): string {
  const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' })
  if (week <= 2) return dayName // this week, next week, week after: day name only
  const day = date.getDate()
  return `${dayName} ${day}${getOrdinalSuffix(day)}`
}

// List formatter with week grouping

export function formatAvailability(days: DayAvailability[]): string {
  const activeDays = days
    .filter(d => d.slots.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (activeDays.length === 0) return ''

  const lines: string[] = []
  let currentWeek = -1

  for (const day of activeDays) {
    const date = parseLocalDate(day.date)
    const week = weekOffset(day.date)
    const label = weekAwareDayLabel(date, week)
    const slotsText = formatDaySlots(day.slots)

    if (week !== currentWeek) {
      if (week === 0 && currentWeek === -1) {
        lines.push('I have:')
      } else if (week === 0) {
        // shouldn't happen (week goes forward), but safe fallback
        lines.push('This week:')
      } else if (week === 1) {
        if (currentWeek === -1) lines.push('I have:')
        lines.push('Next week:')
      } else if (week === 2) {
        if (currentWeek === -1) lines.push('I have:')
        lines.push('Week after:')
      } else {
        if (currentWeek === -1) lines.push('I have:')
        // No extra header for 3+ weeks, dates have numbers
      }
      currentWeek = week
    }

    if (day.slots.length > 1) {
      lines.push(`  - ${label}, ${slotsText}`)
    } else {
      lines.push(`  - ${label} ${slotsText}`)
    }
  }

  // If we never hit week 0 (all dates are next week+), add "I have:" at the start
  if (!lines[0]?.startsWith('I have:')) {
    lines.unshift('I have:')
  }

  return lines.join('\n')
}

// Shared helpers for grid formatters

function shortDayLabel(date: Date): string {
  const day = date.getDate()
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' })
  return `${weekday} ${day}`
}

function getActiveDays(days: DayAvailability[]) {
  const activeDays = days
    .filter(d => d.slots.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
  const labels = activeDays.map(day => shortDayLabel(parseLocalDate(day.date)))
  const maxLabelWidth = Math.max(...labels.map(l => l.length), 0)
  return { activeDays, labels, maxLabelWidth }
}

// Grid formatter: monospace text grid wrapped in backticks for WhatsApp/Telegram

function gridSymbol(slots: SlotSelection[], timeOfDay: TimeOfDay): string {
  const slot = slots.find(s => s.timeOfDay === timeOfDay)
  if (!slot) return '·'
  return slot.status === 'if-need-be' ? '~' : '✓'
}

export function formatGrid(days: DayAvailability[]): string {
  const { activeDays, labels, maxLabelWidth } = getActiveDays(days)
  if (activeDays.length === 0) return ''

  const gap = '  '
  const header = ' '.repeat(maxLabelWidth) + gap + 'M  A  E'

  const rows = activeDays.map((day, i) => {
    const label = labels[i].padEnd(maxLabelWidth)
    const m = gridSymbol(day.slots, 'morning')
    const a = gridSymbol(day.slots, 'afternoon')
    const e = gridSymbol(day.slots, 'evening')
    return `${label}${gap}${m}  ${a}  ${e}`
  })

  const legend = '✓ free  ~ if need be\nM morning  A afternoon  E evening'
  return '```\n' + header + '\n' + rows.join('\n') + '\n' + legend + '\n```'
}

// Emoji grid formatter: colored squares

function emojiSymbol(slots: SlotSelection[], timeOfDay: TimeOfDay): string {
  const slot = slots.find(s => s.timeOfDay === timeOfDay)
  if (!slot) return '⬜'
  return slot.status === 'if-need-be' ? '🟧' : '🟩'
}

export function formatEmoji(days: DayAvailability[]): string {
  const { activeDays, labels, maxLabelWidth } = getActiveDays(days)
  if (activeDays.length === 0) return ''

  const pad = ' '.repeat(maxLabelWidth + 2)
  const header = `${pad}🌅☀️🌙`
  const rows = activeDays.map((day, i) => {
    const label = labels[i].padEnd(maxLabelWidth)
    const m = emojiSymbol(day.slots, 'morning')
    const a = emojiSymbol(day.slots, 'afternoon')
    const e = emojiSymbol(day.slots, 'evening')
    return `${label}  ${m}${a}${e}`
  })

  const legend = '🟩 free  🟧 if need be'
  return '```\n' + header + '\n' + rows.join('\n') + '\n' + legend + '\n```'
}

// Chat formatter: natural conversational sentence with week awareness

function chatSlots(slots: SlotSelection[]): string {
  const sorted = [...slots].sort(
    (a, b) => TIME_ORDER.indexOf(a.timeOfDay) - TIME_ORDER.indexOf(b.timeOfDay)
  )

  if (sorted.length === 3 && sorted.every(s => s.status === sorted[0].status)) {
    return sorted[0].status === 'if-need-be' ? 'all day (if need be)' : 'all day'
  }

  const parts = sorted.map(s => {
    const name = s.timeOfDay
    return s.status === 'if-need-be' ? `${name} (if need be)` : name
  })

  return joinNatural(parts)
}

function joinNatural(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]
}

export function formatChat(days: DayAvailability[]): string {
  const activeDays = days
    .filter(d => d.slots.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (activeDays.length === 0) return ''

  // Group by week
  const weekGroups: { week: number; parts: string[] }[] = []

  for (const day of activeDays) {
    const date = parseLocalDate(day.date)
    const week = weekOffset(day.date)
    const label = weekAwareDayLabel(date, week)
    const slots = chatSlots(day.slots)

    let group = weekGroups.find(g => g.week === week)
    if (!group) {
      group = { week, parts: [] }
      weekGroups.push(group)
    }
    group.parts.push(`${label} ${slots}`)
  }

  // Build sentence with week prefixes
  const segments: string[] = []
  for (const group of weekGroups) {
    const joined = joinNatural(group.parts)
    if (group.week === 0) {
      segments.push(joined)
    } else if (group.week === 1) {
      segments.push(`next week ${joined}`)
    } else if (group.week === 2) {
      segments.push(`week after ${joined}`)
    } else {
      segments.push(joined)
    }
  }

  return `I'm free ${joinNatural(segments)}`
}

export type OutputFormat = 'list' | 'grid' | 'emoji' | 'chat'
