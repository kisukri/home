import { describe, expect, it } from 'vitest'
import { formatClock, formatDays, formatYearsDays, pad, spans } from '@/utils/time'

describe('pad', () => {
  it('pads to two digits', () => {
    expect(pad(3)).toBe('03')
    expect(pad(12)).toBe('12')
  })
})

describe('spans', () => {
  const byKey = Object.fromEntries(spans(new Date(2026, 10, 10, 12, 0, 0)).map((s) => [s.key, s]))

  it('measures the day', () => {
    expect(byKey.day!.elapsed).toBe(12 * 3_600_000)
    expect(byKey.day!.ratio).toBe(0.5)
  })

  it('starts the week on Monday', () => {
    expect(byKey.week!.elapsed).toBe(36 * 3_600_000)
  })

  it('treats Sunday as the last day of the week', () => {
    const sunday = spans(new Date(2026, 10, 15, 0, 0, 0)).find((s) => s.key === 'week')!
    expect(sunday.elapsed).toBe(6 * 86_400_000)
  })

  it('measures the month and the year', () => {
    expect(byKey.month!.elapsed).toBe(9.5 * 86_400_000)
    expect(byKey.month!.ratio).toBeCloseTo(9.5 / 30)
    expect(byKey.year!.ratio).toBeGreaterThan(0.85)
    expect(byKey.year!.ratio).toBeLessThan(0.87)
  })

  it('keeps ratios within 0–1', () => {
    for (const s of spans(new Date(2026, 11, 31, 23, 59, 59))) {
      expect(s.ratio).toBeGreaterThan(0)
      expect(s.ratio).toBeLessThanOrEqual(1)
    }
  })
})

describe('formatters', () => {
  it('formats a clock duration', () => {
    expect(formatClock(3_723_000)).toBe('1時間2分3秒')
  })

  it('formats days and hours', () => {
    expect(formatDays(5 * 3_600_000)).toBe('5時間')
    expect(formatDays(50 * 3_600_000)).toBe('2日2時間')
  })

  it('formats years and days since a date', () => {
    const since = new Date(2020, 0, 6)
    expect(formatYearsDays(since, new Date(2026, 0, 6, 9))).toBe('6年0日')
    expect(formatYearsDays(since, new Date(2026, 0, 5, 9))).toBe('5年364日')
    expect(formatYearsDays(since, new Date(2020, 0, 16))).toBe('10日')
  })
})
