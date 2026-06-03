import { describe, it, expect } from 'vitest'
import { formatAvailability, formatGrid } from '../useFormatter'
import type { DayAvailability } from '../../types'

describe('formatAvailability (list)', () => {
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
          { timeOfDay: 'afternoon', status: 'if-need-be' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    expect(formatAvailability(days)).toBe(
      'I have:\n  - Monday 1st, morning + afternoon - If need be + evening'
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
})

describe('formatGrid', () => {
  it('returns empty string for no selections', () => {
    expect(formatGrid([])).toBe('')
    expect(formatGrid([{ date: '2026-06-05', slots: [] }])).toBe('')
  })

  it('renders a single day with one slot', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-03', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
    ]
    const result = formatGrid(days)
    expect(result).toContain('M  A  E')
    expect(result).toContain('Wed 3')
    expect(result).toContain('·  ·  ✓')
    expect(result).toContain('✓ free  ~ if need be')
    expect(result.startsWith('```\n')).toBe(true)
    expect(result).toContain('```\n✓')
  })

  it('renders if-need-be as ~', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-08', slots: [{ timeOfDay: 'morning', status: 'if-need-be' }] },
    ]
    const result = formatGrid(days)
    expect(result).toContain('~  ·  ·')
  })

  it('renders multiple days sorted chronologically', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-10', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
      { date: '2026-06-03', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
    ]
    const result = formatGrid(days)
    const lines = result.split('\n')
    const dataLines = lines.filter(l => l.includes('Wed') || l.includes('Tue'))
    expect(dataLines[0]).toContain('Wed 3')
    expect(dataLines[1]).toContain('Wed 10')
  })

  it('aligns columns with mixed-width day labels', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-03', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
      { date: '2026-06-15', slots: [{ timeOfDay: 'afternoon', status: 'yes' }] },
    ]
    const result = formatGrid(days)
    const lines = result.split('\n')

    // Find the header line and verify M column position
    const headerLine = lines.find(l => l.includes('M  A  E'))!
    const mColPos = headerLine.indexOf('M')

    // Data lines should have their first symbol at the same position
    const wed3Line = lines.find(l => l.includes('Wed 3'))!
    const mon15Line = lines.find(l => l.includes('Mon 15'))!
    const wed3SymPos = wed3Line.indexOf('✓')
    const mon15SymPos = mon15Line.indexOf('·')
    expect(wed3SymPos).toBe(mColPos)
    expect(mon15SymPos).toBe(mColPos)
  })

  it('renders the full user scenario from the design doc', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-03', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
      { date: '2026-06-07', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
      { date: '2026-06-08', slots: [{ timeOfDay: 'morning', status: 'if-need-be' }] },
      {
        date: '2026-06-11',
        slots: [
          { timeOfDay: 'morning', status: 'yes' },
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
      {
        date: '2026-06-15',
        slots: [
          { timeOfDay: 'morning', status: 'if-need-be' },
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'if-need-be' },
        ],
      },
    ]
    const result = formatGrid(days)
    expect(result).toContain('Wed 3')
    expect(result).toContain('Thu 11')
    expect(result).toContain('Mon 15')
    // Thu 11 should show all three as ✓
    const thu11Line = result.split('\n').find(l => l.includes('Thu 11'))
    expect(thu11Line).toContain('✓  ✓  ✓')
    // Mon 15 should show ~ ✓ ~
    const mon15Line = result.split('\n').find(l => l.includes('Mon 15'))
    expect(mon15Line).toContain('~  ✓  ~')
  })
})
