import { describe, it, expect } from 'vitest'
import { formatAvailability } from '../useFormatter'
import type { DayAvailability } from '../../types'

describe('formatAvailability', () => {
  it('returns empty string for no selections', () => {
    expect(formatAvailability([])).toBe('')
    expect(formatAvailability([{ date: '2026-06-05', slots: [] }])).toBe('')
  })

  it('formats a single slot with default status (no comma)', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-05', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Friday 5th evening')
  })

  it('formats a single slot with if-need-be status', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-02', slots: [{ timeOfDay: 'evening', status: 'if-need-be' }] },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Tuesday 2nd evening - If need be')
  })

  it('formats a single slot with maybe status', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-03', slots: [{ timeOfDay: 'afternoon', status: 'maybe' }] },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Wednesday 3rd afternoon - Maybe')
  })

  it('formats multiple slots on the same day with comma', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-07',
        slots: [
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Sunday 7th, afternoon + evening')
  })

  it('collapses all three slots with same status to "all day"', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-01',
        slots: [
          { timeOfDay: 'morning', status: 'yes' },
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Monday 1st, all day')
  })

  it('collapses all three with if-need-be to "all day - If need be"', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-01',
        slots: [
          { timeOfDay: 'morning', status: 'if-need-be' },
          { timeOfDay: 'afternoon', status: 'if-need-be' },
          { timeOfDay: 'evening', status: 'if-need-be' },
        ],
      },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Monday 1st, all day - If need be')
  })

  it('does not collapse three slots with mixed statuses', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-01',
        slots: [
          { timeOfDay: 'morning', status: 'yes' },
          { timeOfDay: 'afternoon', status: 'maybe' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    expect(formatAvailability(days)).toBe(
      'I have:\n  - Monday 1st, morning + afternoon - Maybe + evening'
    )
  })

  it('sorts slots within a day by time order', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-05',
        slots: [
          { timeOfDay: 'evening', status: 'yes' },
          { timeOfDay: 'morning', status: 'yes' },
        ],
      },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Friday 5th, morning + evening')
  })

  it('sorts days chronologically', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-10', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
      { date: '2026-06-03', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
      { date: '2026-06-07', slots: [{ timeOfDay: 'afternoon', status: 'yes' }] },
    ]
    const result = formatAvailability(days)
    expect(result).toBe(
      'I have:\n  - Wednesday 3rd evening\n  - Sunday 7th afternoon\n  - Wednesday 10th evening'
    )
  })

  it('matches the design doc example output', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-01',
        slots: [
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
      {
        date: '2026-06-02',
        slots: [{ timeOfDay: 'evening', status: 'if-need-be' }],
      },
      {
        date: '2026-06-05',
        slots: [{ timeOfDay: 'evening', status: 'yes' }],
      },
      {
        date: '2026-06-07',
        slots: [
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    expect(formatAvailability(days)).toBe(
      'I have:\n' +
      '  - Monday 1st, afternoon + evening\n' +
      '  - Tuesday 2nd evening - If need be\n' +
      '  - Friday 5th evening\n' +
      '  - Sunday 7th, afternoon + evening'
    )
  })
})
