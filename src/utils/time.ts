export const pad = (n: number) => String(n).padStart(2, '0')

export interface Span {
  key: 'day' | 'week' | 'month' | 'year'
  label: string
  elapsed: number
  ratio: number
}

export function spans(d: Date): Span[] {
  const t = d.getTime()
  const y = d.getFullYear()
  const m = d.getMonth()
  const date = d.getDate()
  const monday = date - ((d.getDay() + 6) % 7)

  const ranges: [Span['key'], string, Date, Date][] = [
    ['day', '今日', new Date(y, m, date), new Date(y, m, date + 1)],
    ['week', '今週', new Date(y, m, monday), new Date(y, m, monday + 7)],
    ['month', '今月', new Date(y, m, 1), new Date(y, m + 1, 1)],
    ['year', '今年', new Date(y, 0, 1), new Date(y + 1, 0, 1)],
  ]

  return ranges.map(([key, label, start, end]) => {
    const elapsed = Math.max(0, t - start.getTime())
    return { key, label, elapsed, ratio: Math.min(1, elapsed / (end.getTime() - start.getTime())) }
  })
}

export function formatClock(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 3600)}時間${Math.floor((s % 3600) / 60)}分${s % 60}秒`
}

export function formatDays(ms: number) {
  const h = Math.floor(ms / 3_600_000)
  const days = Math.floor(h / 24)
  return days > 0 ? `${days}日${h % 24}時間` : `${h}時間`
}

export function formatYearsDays(since: Date, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let years = today.getFullYear() - since.getFullYear()
  let anniversary = new Date(since.getFullYear() + years, since.getMonth(), since.getDate())
  if (anniversary > today) {
    years--
    anniversary = new Date(since.getFullYear() + years, since.getMonth(), since.getDate())
  }
  const days = Math.round((today.getTime() - anniversary.getTime()) / 86_400_000)
  return years > 0 ? `${years}年${days}日` : `${days}日`
}
