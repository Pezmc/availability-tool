import { describe, it, expect } from 'vitest'
import { formatAvailability, formatGrid, formatEmoji } from '../useFormatter'
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
    expect(result).toContain('Morning')
    expect(result).toContain('Wed 3')
    // Evening column has ✓, morning and afternoon have ·
    const wedLine = result.split('\n').find(l => l.includes('Wed 3'))!
    expect(wedLine.trimEnd().endsWith('✓')).toBe(true)
    expect(wedLine).toContain('·')
    expect(result).toContain('✓ free  ~ if need be')
    expect(result.startsWith('```\n')).toBe(true)
    expect(result.endsWith('\n```')).toBe(true)
  })

  it('renders if-need-be as ~', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-08', slots: [{ timeOfDay: 'morning', status: 'if-need-be' }] },
    ]
    const result = formatGrid(days)
    // The ~ symbol should appear in the morning column
    const monLine = result.split('\n').find(l => l.includes('Mon 8'))!
    expect(monLine).toContain('~')
    // Evening column should have ·
    expect(monLine.trimEnd().endsWith('·')).toBe(true)
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

  it('aligns rows consistently with mixed-width day labels', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-03', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
      { date: '2026-06-15', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
    ]
    const result = formatGrid(days)
    const lines = result.split('\n')

    // Both data rows should have their ✓ at the same column position
    const wed3Line = lines.find(l => l.includes('Wed 3'))!
    const mon15Line = lines.find(l => l.includes('Mon 15'))!
    expect(wed3Line.indexOf('✓')).toBe(mon15Line.indexOf('✓'))
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
    const thu11Line = result.split('\n').find(l => l.includes('Thu 11'))!
    expect(thu11Line.match(/✓/g)?.length).toBe(3)
    expect(thu11Line).not.toContain('·')
    // Mon 15 should have ~ then ✓ then ~
    const mon15Line = result.split('\n').find(l => l.includes('Mon 15'))!
    expect(mon15Line.match(/~/g)?.length).toBe(2)
    expect(mon15Line.match(/✓/g)?.length).toBe(1)
  })
})

describe('formatEmoji', () => {
  it('returns empty string for no selections', () => {
    expect(formatEmoji([])).toBe('')
  })

  it('renders green squares for yes and orange for if-need-be', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-03',
        slots: [
          { timeOfDay: 'morning', status: 'yes' },
          { timeOfDay: 'evening', status: 'if-need-be' },
        ],
      },
    ]
    const result = formatEmoji(days)
    expect(result).toContain('🟩')
    expect(result).toContain('🟧')
    expect(result).toContain('⬜')
    expect(result).toContain('Wed 3')
    expect(result).toContain('🟩 free  🟧 if need be')
  })

  it('renders multiple days', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-03', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
      { date: '2026-06-05', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
    ]
    const result = formatEmoji(days)
    expect(result).toContain('Wed 3')
    expect(result).toContain('Fri 5')
  })
})
