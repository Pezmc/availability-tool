import type { DayAvailability, SlotSelection, TimeOfDay } from '../types'
import { formatDayLabel, parseLocalDate } from '../utils/dates'

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

export function formatAvailability(days: DayAvailability[]): string {
  const activeDays = days
    .filter(d => d.slots.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (activeDays.length === 0) return ''

  const lines = activeDays.map(day => {
    const date = parseLocalDate(day.date)
    const label = formatDayLabel(date)
    const slotsText = formatDaySlots(day.slots)

    if (day.slots.length > 1) {
      return `  - ${label}, ${slotsText}`
    }
    return `  - ${label} ${slotsText}`
  })

  return `I have:\n${lines.join('\n')}`
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

// Emoji grid formatter: colored squares, no monospace needed

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

export type OutputFormat = 'list' | 'grid' | 'emoji'
