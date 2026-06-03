import { ref, watch } from 'vue'
import type { AvailabilityState, DayAvailability, SlotSelection, TimeOfDay, Status } from '../types'
import { todayDateString, generateDateRange } from '../utils/dates'

const STORAGE_KEY = 'availability-state'
const DAYS_TO_SHOW = 21

const STATUS_CYCLE: (Status | 'off')[] = ['yes', 'if-need-be', 'maybe', 'off']

function loadState(): AvailabilityState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AvailabilityState
  } catch {
    return null
  }
}

function saveState(state: AvailabilityState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function prunePastDates(days: DayAvailability[]): DayAvailability[] {
  const today = todayDateString()
  return days.filter(d => d.date >= today)
}

export function useAvailability() {
  const today = todayDateString()
  const dateRange = generateDateRange(today, DAYS_TO_SHOW)

  const saved = loadState()
  const prunedSaved = saved ? prunePastDates(saved.days) : []

  const initialDays: DayAvailability[] = dateRange.map(date => {
    const existing = prunedSaved.find(d => d.date === date)
    return existing ?? { date, slots: [] }
  })

  const days = ref<DayAvailability[]>(initialDays)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(days, (newDays) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      saveState({
        days: newDays.filter(d => d.slots.length > 0),
        lastUpdated: new Date().toISOString(),
      })
    }, 300)
  }, { deep: true })

  function toggleSlot(date: string, timeOfDay: TimeOfDay): void {
    const day = days.value.find(d => d.date === date)
    if (!day) return

    const existingIndex = day.slots.findIndex(s => s.timeOfDay === timeOfDay)
    if (existingIndex === -1) {
      day.slots.push({ timeOfDay, status: 'yes' })
    } else {
      const current = day.slots[existingIndex]
      const currentIdx = STATUS_CYCLE.indexOf(current.status)
      const next = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length]
      if (next === 'off') {
        day.slots.splice(existingIndex, 1)
      } else {
        current.status = next
      }
    }
  }

  function getSlot(date: string, timeOfDay: TimeOfDay): SlotSelection | undefined {
    const day = days.value.find(d => d.date === date)
    return day?.slots.find(s => s.timeOfDay === timeOfDay)
  }

  function clearAll(): void {
    for (const day of days.value) {
      day.slots = []
    }
  }

  function hasSelections(): boolean {
    return days.value.some(d => d.slots.length > 0)
  }

  return { days, toggleSlot, getSlot, clearAll, hasSelections }
}
