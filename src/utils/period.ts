export type PeriodName = 'night' | 'dawn' | 'day' | 'dusk' | 'evening'

export interface Palette {
  theme: 'light' | 'dark'
  sky: [string, string, string]
  glow: string
  body: 'sun' | 'moon'
  bodyColor: string
  mountains: [string, string, string, string]
  mist: string
  scrim: number
  stars: number
  cloud: string
  mote: string
  label: string
  en: string
}

export const THEME_INK = { dark: '#f6f3f0', light: '#18223a' } as const

export const BASE_BACKGROUND = '#0b0f27'

export const PALETTES: Record<PeriodName, Palette> = {
  night: {
    theme: 'dark',
    sky: ['#060a1c', '#121a3e', '#2a2f5c'],
    glow: 'rgb(170 190 255 / 0.22)',
    body: 'moon',
    bodyColor: '#f6f1dc',
    mountains: ['#262d58', '#1b2148', '#121738', '#0b0f27'],
    mist: 'rgb(90 100 170 / 0.28)',
    scrim: 0.35,
    stars: 1,
    cloud: 'rgb(120 130 200 / 0.12)',
    mote: '#cfd8ff',
    label: '夜',
    en: 'Night',
  },
  dawn: {
    theme: 'dark',
    sky: ['#25335f', '#8a72a8', '#f4b597'],
    glow: 'rgb(255 196 150 / 0.45)',
    body: 'sun',
    bodyColor: '#ffe2bd',
    mountains: ['#8a77a6', '#62598a', '#433f6c', '#2a2849'],
    mist: 'rgb(255 205 185 / 0.3)',
    scrim: 0.55,
    stars: 0.35,
    cloud: 'rgb(255 214 200 / 0.3)',
    mote: '#ffe3cc',
    label: '暁',
    en: 'Dawn',
  },
  day: {
    theme: 'light',
    sky: ['#7fb6f2', '#bcdcff', '#fbeedf'],
    glow: 'rgb(255 244 214 / 0.75)',
    body: 'sun',
    bodyColor: '#fffaf0',
    mountains: ['#c9d8ee', '#b6c9e6', '#a6bde0', '#9db5dc'],
    mist: 'rgb(255 255 255 / 0.5)',
    scrim: 0,
    stars: 0,
    cloud: 'rgb(255 255 255 / 0.7)',
    mote: '#ffffff',
    label: '昼',
    en: 'Daylight',
  },
  dusk: {
    theme: 'dark',
    sky: ['#1c2552', '#9a5585', '#ff9d6c'],
    glow: 'rgb(255 160 100 / 0.5)',
    body: 'sun',
    bodyColor: '#ffd29a',
    mountains: ['#8c5079', '#633d68', '#432b53', '#28193a'],
    mist: 'rgb(255 150 130 / 0.28)',
    scrim: 0.55,
    stars: 0.15,
    cloud: 'rgb(255 180 160 / 0.32)',
    mote: '#ffd6b0',
    label: '夕',
    en: 'Dusk',
  },
  evening: {
    theme: 'dark',
    sky: ['#0d1435', '#2e2c66', '#6b4a7c'],
    glow: 'rgb(200 170 255 / 0.25)',
    body: 'moon',
    bodyColor: '#f3ecd8',
    mountains: ['#3a3264', '#2a2550', '#1c1a3c', '#111027'],
    mist: 'rgb(150 120 200 / 0.25)',
    scrim: 0.45,
    stars: 0.8,
    cloud: 'rgb(160 140 220 / 0.14)',
    mote: '#e4d6ff',
    label: '宵',
    en: 'Evening',
  },
}

export const PERIOD_BOUNDS: readonly (readonly [number, PeriodName])[] = [
  [5, 'night'],
  [7.5, 'dawn'],
  [16.5, 'day'],
  [19, 'dusk'],
  [22.5, 'evening'],
]
export const PERIOD_WRAP: PeriodName = 'night'

export const isPeriod = (v: unknown): v is PeriodName => typeof v === 'string' && Object.hasOwn(PALETTES, v)

export function parseHour(value: string | null): number | null {
  if (value === null || value.trim() === '') return null
  const hour = Number(value)
  return hour >= 0 && hour < 24 ? hour : null
}

export function periodOfHour(h: number): PeriodName {
  return PERIOD_BOUNDS.find(([end]) => h < end)?.[1] ?? PERIOD_WRAP
}

export function periodOf(d: Date): PeriodName {
  return periodOfHour(d.getHours() + d.getMinutes() / 60)
}

export function greetingOf(d: Date): string {
  const h = d.getHours()
  if (h >= 5 && h < 11) return 'おはよう'
  if (h >= 11 && h < 17) return 'こんにちは'
  if (h >= 17 && h < 23) return 'こんばんは'
  return 'おやすみ'
}

const ARC = { sun: { start: 5, span: 14 }, moon: { start: 18.5, span: 13 } } as const

export function celestialPosition(d: Date, body: 'sun' | 'moon') {
  const h = d.getHours() + d.getMinutes() / 60
  const { start, span } = ARC[body]
  const t = Math.min(1, ((((h - start) % 24) + 24) % 24) / span)
  return {
    x: 10 + t * 80,
    y: 64 - Math.sin(Math.PI * t) * 46,
  }
}
