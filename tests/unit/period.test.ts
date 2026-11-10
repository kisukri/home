import { describe, expect, it } from 'vitest'
import { celestialPosition, greetingOf, isPeriod, parseHour, periodOf } from '@/utils/period'

const at = (h: number, m = 0) => new Date(2026, 5, 15, h, m)

describe('periodOf', () => {
  it.each([
    [0, 0, 'night'],
    [4, 59, 'night'],
    [5, 0, 'dawn'],
    [7, 29, 'dawn'],
    [7, 30, 'day'],
    [16, 29, 'day'],
    [16, 30, 'dusk'],
    [18, 59, 'dusk'],
    [19, 0, 'evening'],
    [22, 29, 'evening'],
    [22, 30, 'night'],
    [23, 59, 'night'],
  ] as const)('%i:%i → %s', (h, m, name) => {
    expect(periodOf(at(h, m))).toBe(name)
  })
})

describe('isPeriod', () => {
  it('accepts period names only', () => {
    expect(isPeriod('dusk')).toBe(true)
    expect(isPeriod('noon')).toBe(false)
    expect(isPeriod(null)).toBe(false)
    expect(isPeriod('constructor')).toBe(false)
  })
})

describe('parseHour', () => {
  it('accepts hours within a day', () => {
    expect(parseHour('0')).toBe(0)
    expect(parseHour('5.25')).toBe(5.25)
    expect(parseHour('23.99')).toBe(23.99)
  })

  it('rejects missing, empty and out-of-range values', () => {
    expect(parseHour(null)).toBeNull()
    expect(parseHour('')).toBeNull()
    expect(parseHour(' ')).toBeNull()
    expect(parseHour('abc')).toBeNull()
    expect(parseHour('-1')).toBeNull()
    expect(parseHour('24')).toBeNull()
    expect(parseHour('99')).toBeNull()
  })
})

describe('greetingOf', () => {
  it('follows the hour', () => {
    expect(greetingOf(at(4))).toBe('おやすみ')
    expect(greetingOf(at(5))).toBe('おはよう')
    expect(greetingOf(at(11))).toBe('こんにちは')
    expect(greetingOf(at(17))).toBe('こんばんは')
    expect(greetingOf(at(23))).toBe('おやすみ')
  })
})

describe('celestialPosition', () => {
  it('rises on the left when dawn begins', () => {
    expect(celestialPosition(at(5), 'sun').x).toBe(10)
    expect(celestialPosition(at(5, 15), 'sun').x).toBeLessThan(15)
  })

  it('moves left to right without jumping through the sun periods', () => {
    let last = 10
    for (let minutes = 5 * 60; minutes <= 19 * 60; minutes += 5) {
      const { x } = celestialPosition(at(Math.floor(minutes / 60), minutes % 60), 'sun')
      expect(x).toBeGreaterThanOrEqual(last)
      expect(x - last).toBeLessThan(1)
      last = x
    }
    expect(last).toBe(90)
  })

  it('peaks at midday', () => {
    const noon = celestialPosition(at(12), 'sun')
    expect(noon.x).toBe(50)
    expect(noon.y).toBe(18)
  })

  it('keeps the moon moving across evening and night', () => {
    const evening = celestialPosition(at(19), 'moon').x
    const midnight = celestialPosition(at(0), 'moon').x
    const late = celestialPosition(at(4, 59), 'moon').x
    expect(evening).toBeLessThan(midnight)
    expect(midnight).toBeLessThan(late)
    expect(late).toBeLessThan(90)
  })
})
