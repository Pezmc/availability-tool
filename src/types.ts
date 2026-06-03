export type TimeOfDay = 'morning' | 'afternoon' | 'evening'
export type Status = 'yes' | 'if-need-be'

export interface SlotSelection {
  timeOfDay: TimeOfDay
  status: Status
}

export interface DayAvailability {
  date: string // ISO date: '2026-06-05'
  slots: SlotSelection[]
}

export interface AvailabilityState {
  days: DayAvailability[]
  lastUpdated: string
}
