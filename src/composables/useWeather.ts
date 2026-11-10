import { onBeforeUnmount, onMounted, ref, type Component } from 'vue'
import { site } from '@/config/site'

import PhSun from '~icons/ph/sun-duotone'
import PhMoon from '~icons/ph/moon-duotone'
import PhCloudSun from '~icons/ph/cloud-sun-duotone'
import PhCloudMoon from '~icons/ph/cloud-moon-duotone'
import PhCloud from '~icons/ph/cloud-duotone'
import PhCloudFog from '~icons/ph/cloud-fog-duotone'
import PhCloudRain from '~icons/ph/cloud-rain-duotone'
import PhCloudSnow from '~icons/ph/cloud-snow-duotone'
import PhCloudLightning from '~icons/ph/cloud-lightning-duotone'

export interface Weather {
  city: string
  text: string
  icon: Component
  temp: number
  min: number
  max: number
  humidity: number
  wind: number
}

function describe(code: number, isDay: boolean): { text: string; icon: Component } {
  if (code === 0) return { text: '晴れ', icon: isDay ? PhSun : PhMoon }
  if (code === 1) return { text: '晴れ時々曇り', icon: isDay ? PhCloudSun : PhCloudMoon }
  if (code === 2) return { text: '薄曇り', icon: isDay ? PhCloudSun : PhCloudMoon }
  if (code === 3) return { text: '曇り', icon: PhCloud }
  if (code === 45 || code === 48) return { text: '霧', icon: PhCloudFog }
  if (code >= 51 && code <= 57) return { text: '霧雨', icon: PhCloudRain }
  if (code === 61 || code === 80) return { text: '小雨', icon: PhCloudRain }
  if (code === 63 || code === 81) return { text: '雨', icon: PhCloudRain }
  if (code === 65 || code === 82) return { text: '大雨', icon: PhCloudRain }
  if (code === 66 || code === 67) return { text: 'みぞれ', icon: PhCloudRain }
  if (code === 71 || code === 85) return { text: '小雪', icon: PhCloudSnow }
  if (code === 73 || code === 77) return { text: '雪', icon: PhCloudSnow }
  if (code === 75 || code === 86) return { text: '大雪', icon: PhCloudSnow }
  if (code >= 95) return { text: '雷雨', icon: PhCloudLightning }
  return { text: '—', icon: PhCloud }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json() as Promise<T>
}

async function locate() {
  if (site.weather.location) return site.weather.location
  const geo = await getJson<{ city?: string; latitude: string; longitude: string }>(
    'https://get.geojs.io/v1/ip/geo.json',
  )
  const latitude = Number(geo.latitude)
  const longitude = Number(geo.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error('location unavailable')
  return { city: geo.city ?? '', latitude, longitude }
}

const REFRESH_MS = 30 * 60_000
const RETRY_MS = 60_000

export function useWeather() {
  const weather = ref<Weather | null>(null)
  let place: Awaited<ReturnType<typeof locate>> | undefined
  let nextAt = 0
  let loading = false

  async function refresh() {
    if (loading) return
    loading = true
    try {
      place ??= await locate()
      const { city, latitude, longitude } = place
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
        daily: 'temperature_2m_max,temperature_2m_min',
        timezone: 'auto',
        forecast_days: '1',
      })
      const data = await getJson<{
        current: {
          temperature_2m: number
          relative_humidity_2m: number
          weather_code: number
          wind_speed_10m: number
          is_day: number
        }
        daily: { temperature_2m_max: number[]; temperature_2m_min: number[] }
      }>(`https://api.open-meteo.com/v1/forecast?${params}`)

      const c = data.current
      weather.value = {
        city,
        ...describe(c.weather_code, c.is_day === 1),
        temp: Math.round(c.temperature_2m),
        min: Math.round(data.daily.temperature_2m_min[0] ?? c.temperature_2m),
        max: Math.round(data.daily.temperature_2m_max[0] ?? c.temperature_2m),
        humidity: Math.round(c.relative_humidity_2m),
        wind: Math.round(c.wind_speed_10m),
      }
      nextAt = Date.now() + REFRESH_MS
    } catch {
      nextAt = Date.now() + RETRY_MS
    } finally {
      loading = false
    }
  }

  const refreshIfStale = () => {
    if (document.visibilityState === 'visible' && Date.now() >= nextAt) refresh()
  }
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    if (!site.weather.enabled) return
    refresh()
    timer = setInterval(refreshIfStale, RETRY_MS)
    document.addEventListener('visibilitychange', refreshIfStale)
  })
  onBeforeUnmount(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', refreshIfStale)
  })

  return { weather }
}
