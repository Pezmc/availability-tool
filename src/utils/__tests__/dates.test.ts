import { describe, it, expect } from 'vitest'
import { getOrdinalSuffix, formatDayLabel, formatCompactLabel, generateDateRange, parseLocalDate, weekOffset } from '../dates'

describe('getOrdinalSuffix', () => {
  it('returns st for 1, 21, 31', () => {
    expect(getOrdinalSuffix(1)).toBe('st')
    expect(getOrdinalSuffix(21)).toBe('st')
    expect(getOrdinalSuffix(31)).toBe('st')
  })

  it('returns nd for 2, 22', () => {
    expect(getOrdinalSuffix(2)).toBe('nd')
    expect(getOrdinalSuffix(22)).toBe('nd')
  })

  it('returns rd for 3, 23', () => {
    expect(getOrdinalSuffix(3)).toBe('rd')
    expect(getOrdinalSuffix(23)).toBe('rd')
  })

  it('returns th for 11, 12, 13 (teen exceptions)', () => {
    expect(getOrdinalSuffix(11)).toBe('th')
    expect(getOrdinalSuffix(12)).toBe('th')
    expect(getOrdinalSuffix(13)).toBe('th')
  })

  it('returns th for 4-10, 14-20, 24-30', () => {
    for (const n of [4, 5, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 19, 20, 24, 25, 26, 27, 28, 29, 30]) {
      expect(getOrdinalSuffix(n)).toBe('th')
    }
  })
})

describe('formatDayLabel', () => {
  it('formats a date as "DayName Nth"', () => {
    const sunday = new Date(2026, 4, 31) // May 31, 2026 is a Sunday
    expect(formatDayLabel(sunday)).toBe('Sunday 31st')
  })

  it('handles teen dates correctly', () => {
    const date = new Date(2026, 5, 11) // June 11, 2026
    expect(formatDayLabel(date)).toBe('Thursday 11th')
  })
})

describe('formatCompactLabel', () => {
  it('formats as "Day N Mon"', () => {
    const date = new Date(2026, 5, 5) // June 5, 2026
    expect(formatCompactLabel(date)).toBe('Fri 5 Jun')
  })
})

describe('parseLocalDate', () => {
  it('parses ISO date string without UTC offset', () => {
    const d = parseLocalDate('2026-06-05')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(5) // 0-indexed
    expect(d.getDate()).toBe(5)
  })
})

describe('generateDateRange', () => {
  it('generates consecutive dates', () => {
    const range = generateDateRange('2026-06-01', 3)
    expect(range).toEqual(['2026-06-01', '2026-06-02', '2026-06-03'])
  })

  it('handles month boundaries', () => {
    const range = generateDateRange('2026-06-29', 4)
    expect(range).toEqual(['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02'])
  })

  it('handles year boundaries', () => {
    const range = generateDateRange('2026-12-30', 4)
    expect(range).toEqual(['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02'])
  })
})

describe('weekOffset', () => {
  // Today = Wednesday 2026-06-03. Week starts Monday.
  // This week: Mon 1 - Sun 7
  // Next week: Mon 8 - Sun 14
  // Week after: Mon 15 - Sun 21
  const today = '2026-06-03'

  it('same week = 0', () => {
    expect(weekOffset('2026-06-03', today)).toBe(0) // Wed (today)
    expect(weekOffset('2026-06-01', today)).toBe(0) // Mon (start of week)
    expect(weekOffset('2026-06-07', today)).toBe(0) // Sun (end of week)
  })

  it('next week = 1', () => {
    expect(weekOffset('2026-06-08', today)).toBe(1) // Mon
    expect(weekOffset('2026-06-14', today)).toBe(1) // Sun
  })

  it('week after = 2', () => {
    expect(weekOffset('2026-06-15', today)).toBe(2)
    expect(weekOffset('2026-06-21', today)).toBe(2)
  })

  it('3 weeks out = 3', () => {
    expect(weekOffset('2026-06-22', today)).toBe(3)
  })
})
