const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export function jpDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`
}

const SEKKI: [string, number][] = [
  ['小寒', 5.4055],
  ['大寒', 20.12],
  ['立春', 3.87],
  ['雨水', 18.73],
  ['啓蟄', 5.63],
  ['春分', 20.646],
  ['清明', 4.81],
  ['穀雨', 20.1],
  ['立夏', 5.52],
  ['小満', 21.04],
  ['芒種', 5.678],
  ['夏至', 21.37],
  ['小暑', 7.108],
  ['大暑', 22.83],
  ['立秋', 7.5],
  ['処暑', 23.13],
  ['白露', 7.646],
  ['秋分', 23.042],
  ['寒露', 8.318],
  ['霜降', 23.438],
  ['立冬', 7.438],
  ['小雪', 22.36],
  ['大雪', 7.18],
  ['冬至', 21.94],
]

const EXCEPTIONS: Record<string, number> = {
  '2019-小寒': -1,
  '2082-大寒': 1,
  '2026-雨水': -1,
  '2084-春分': 1,
  '2008-小満': 1,
  '2016-小暑': 1,
  '2002-立秋': 1,
  '2089-霜降': 1,
  '2089-立冬': 1,
  '2021-冬至': -1,
}

export function sekkiDate(year: number, index: number): Date | null {
  const entry = SEKKI[index]
  if (!entry || year < 2001 || year > 2099) return null
  const [name, c] = entry
  const y = year % 100
  const leap = index < 4 ? Math.floor((y - 1) / 4) : Math.floor(y / 4)
  const day = Math.floor(y * 0.2422 + c) - leap + (EXCEPTIONS[`${year}-${name}`] ?? 0)
  return new Date(year, Math.floor(index / 2), day)
}

export function sekkiToday(d: Date): string | null {
  for (const index of [d.getMonth() * 2, d.getMonth() * 2 + 1]) {
    if (sekkiDate(d.getFullYear(), index)?.getDate() === d.getDate()) return SEKKI[index]![0]
  }
  return null
}

export const SEKKI_NAMES = SEKKI.map(([name]) => name)
