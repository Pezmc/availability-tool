import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatAvailability, formatGrid, formatEmoji, formatChat } from '../useFormatter'
import type { DayAvailability } from '../../types'

// Fix "today" to Wednesday 2026-06-03 for deterministic week-aware tests
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 5, 3)) // June 3, 2026 (Wednesday)
})
afterEach(() => {
  vi.useRealTimers()
})

describe('formatAvailability (list)', () => {
  it('returns empty string for no selections', () => {
    expect(formatAvailability([])).toBe('')
    expect(formatAvailability([{ date: '2026-06-05', slots: [] }])).toBe('')
  })

  it('this week: day name only, no date number', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-05', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Friday evening')
  })

  it('next week: adds "Next week:" header, day name only', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-10', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
    ]
    const result = formatAvailability(days)
    expect(result).toContain('Next week:')
    expect(result).toContain('  - Wednesday evening')
  })

  it('week after: adds "Week after:" header', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-17', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
    ]
    const result = formatAvailability(days)
    expect(result).toContain('Week after:')
    expect(result).toContain('  - Wednesday morning')
  })

  it('3+ weeks out: uses day name + date number', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-24', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
    ]
    const result = formatAvailability(days)
    expect(result).toContain('Wednesday 24th')
  })

  it('groups this week and next week correctly', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-05', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
      { date: '2026-06-07', slots: [{ timeOfDay: 'afternoon', status: 'yes' }] },
      { date: '2026-06-10', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
      { date: '2026-06-12', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
    ]
    const result = formatAvailability(days)
    expect(result).toBe(
      'I have:\n' +
      '  - Friday evening\n' +
      '  - Sunday afternoon\n' +
      'Next week:\n' +
      '  - Wednesday evening\n' +
      '  - Friday morning'
    )
  })

  it('formats if-need-be status', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-05', slots: [{ timeOfDay: 'evening', status: 'if-need-be' }] },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Friday evening - If need be')
  })

  it('collapses all three slots to "all day"', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-05',
        slots: [
          { timeOfDay: 'morning', status: 'yes' },
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Friday, all day')
  })

  it('formats multiple slots with comma', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-05',
        slots: [
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    expect(formatAvailability(days)).toBe('I have:\n  - Friday, afternoon + evening')
  })

  it('sorts days chronologically', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-07', slots: [{ timeOfDay: 'afternoon', status: 'yes' }] },
      { date: '2026-06-03', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
    ]
    const result = formatAvailability(days)
    const lines = result.split('\n')
    expect(lines[1]).toContain('Wednesday')
    expect(lines[2]).toContain('Sunday')
  })
})

describe('formatGrid', () => {
  it('returns empty string for no selections', () => {
    expect(formatGrid([])).toBe('')
  })

  it('renders a grid with M A E headers', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-03', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
    ]
    const result = formatGrid(days)
    expect(result).toContain('M  A  E')
    expect(result).toContain('Wed 3')
    expect(result.startsWith('```\n')).toBe(true)
    expect(result.endsWith('\n```')).toBe(true)
  })

  it('renders if-need-be as ~', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-08', slots: [{ timeOfDay: 'morning', status: 'if-need-be' }] },
    ]
    const result = formatGrid(days)
    const monLine = result.split('\n').find(l => l.includes('Mon 8'))!
    expect(monLine).toContain('~')
    expect(monLine.trimEnd().endsWith('·')).toBe(true)
  })

  it('aligns rows consistently', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-03', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
      { date: '2026-06-15', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
    ]
    const result = formatGrid(days)
    const lines = result.split('\n')
    const wed3Line = lines.find(l => l.includes('Wed 3'))!
    const mon15Line = lines.find(l => l.includes('Mon 15'))!
    expect(wed3Line.indexOf('✓')).toBe(mon15Line.indexOf('✓'))
  })

  it('renders all-day correctly', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-11',
        slots: [
          { timeOfDay: 'morning', status: 'yes' },
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    const result = formatGrid(days)
    const thu11Line = result.split('\n').find(l => l.includes('Thu 11'))!
    expect(thu11Line.match(/✓/g)?.length).toBe(3)
  })
})

describe('formatEmoji', () => {
  it('returns empty string for no selections', () => {
    expect(formatEmoji([])).toBe('')
  })

  it('renders colored squares with legend', () => {
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
    expect(result).toContain('🟩 free  🟧 if need be')
  })
})

describe('formatChat', () => {
  it('returns empty string for no selections', () => {
    expect(formatChat([])).toBe('')
  })

  it('this week: day name only', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-05', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
    ]
    expect(formatChat(days)).toBe("I'm free Friday evening")
  })

  it('next week: prefixes with "next week"', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-10', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
    ]
    expect(formatChat(days)).toBe("I'm free next week Wednesday evening")
  })

  it('week after: prefixes with "week after"', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-17', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
    ]
    expect(formatChat(days)).toBe("I'm free week after Wednesday morning")
  })

  it('3+ weeks: uses day + number', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-24', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
    ]
    expect(formatChat(days)).toBe("I'm free Wednesday 24th morning")
  })

  it('mixes this week and next week naturally', () => {
    const days: DayAvailability[] = [
      { date: '2026-06-03', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
      { date: '2026-06-05', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
      { date: '2026-06-06', slots: [{ timeOfDay: 'morning', status: 'if-need-be' }] },
      { date: '2026-06-10', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
      { date: '2026-06-11', slots: [{ timeOfDay: 'evening', status: 'yes' }] },
      { date: '2026-06-17', slots: [{ timeOfDay: 'morning', status: 'yes' }] },
    ]
    const result = formatChat(days)
    expect(result).toContain("Wednesday evening")
    expect(result).toContain("Friday morning")
    expect(result).toContain("Saturday morning (if need be)")
    expect(result).toContain("next week")
    expect(result).toContain("week after")
    expect(result.startsWith("I'm free ")).toBe(true)
  })

  it('all day on one day', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-05',
        slots: [
          { timeOfDay: 'morning', status: 'yes' },
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    expect(formatChat(days)).toBe("I'm free Friday all day")
  })

  it('multiple slots on one day', () => {
    const days: DayAvailability[] = [
      {
        date: '2026-06-05',
        slots: [
          { timeOfDay: 'afternoon', status: 'yes' },
          { timeOfDay: 'evening', status: 'yes' },
        ],
      },
    ]
    expect(formatChat(days)).toBe("I'm free Friday afternoon and evening")
  })
})
