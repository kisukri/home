import { describe, expect, it } from 'vitest'
import { jpDate, SEKKI_NAMES, sekkiDate, sekkiToday } from '@/utils/koyomi'

const Y2024 = [
  [1, 6],
  [1, 20],
  [2, 4],
  [2, 19],
  [3, 5],
  [3, 20],
  [4, 4],
  [4, 19],
  [5, 5],
  [5, 20],
  [6, 5],
  [6, 21],
  [7, 6],
  [7, 22],
  [8, 7],
  [8, 22],
  [9, 7],
  [9, 22],
  [10, 8],
  [10, 23],
  [11, 7],
  [11, 22],
  [12, 6],
  [12, 21],
] as const

describe('sekkiDate', () => {
  it.each(Y2024.map(([m, d], i) => [SEKKI_NAMES[i]!, i, m, d] as const))('2024 %s', (_, i, m, d) => {
    const date = sekkiDate(2024, i)!
    expect([date.getMonth() + 1, date.getDate()]).toEqual([m, d])
  })

  it('applies the known corrections to the formula', () => {
    expect(sekkiDate(2019, 0)!.getDate()).toBe(5)
    expect(sekkiDate(2026, 3)!.getDate()).toBe(18)
    expect(sekkiDate(2021, 23)!.getDate()).toBe(21)
  })

  it('refuses years outside the range the constants are valid for', () => {
    expect(sekkiDate(1999, 0)).toBeNull()
    expect(sekkiDate(2100, 0)).toBeNull()
  })
})

describe('sekkiToday', () => {
  it('names the term on its day only', () => {
    expect(sekkiToday(new Date(2026, 10, 7, 15))).toBe('立冬')
    expect(sekkiToday(new Date(2026, 10, 8))).toBeNull()
    expect(sekkiToday(new Date(2026, 11, 22))).toBe('冬至')
  })
})

describe('jpDate', () => {
  it('formats month, day and weekday', () => {
    expect(jpDate(new Date(2026, 10, 10))).toBe('11月10日（火）')
  })
})
