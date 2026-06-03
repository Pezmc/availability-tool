import type { DayAvailability, SlotSelection, TimeOfDay } from '../types'
import { formatDayLabel, parseLocalDate } from '../utils/dates'

const TIME_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening']
const STATUS_LABEL: Record<string, string> = {
  'if-need-be': 'If need be',
  'maybe': 'Maybe',
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
