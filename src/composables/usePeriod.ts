import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useNow } from '@/composables/useNow'
import { isPeriod, PALETTES, parseHour, periodOf, type PeriodName } from '@/utils/period'

const SAMPLE_HOUR: Record<PeriodName, number> = { night: 3, dawn: 6.5, day: 12, dusk: 17.6, evening: 20.5 }

function forcedPeriod(): PeriodName | null {
  const hash = location.hash.slice(1)
  if (isPeriod(hash)) return hash
  const param = new URLSearchParams(location.search).get('period')
  return isPeriod(param) ? param : null
}

export function usePeriod() {
  const forced = ref(forcedPeriod())
  const forcedHour = parseHour(new URLSearchParams(location.search).get('hour'))

  const now = useNow('minute')

  const moment = computed(() => {
    const d = new Date(now.value)
    const hour = forced.value ? SAMPLE_HOUR[forced.value] : forcedHour
    if (hour !== null) d.setHours(Math.floor(hour), (hour % 1) * 60)
    return d
  })

  const onHashChange = () => (forced.value = forcedPeriod())

  onMounted(() => window.addEventListener('hashchange', onHashChange))
  onBeforeUnmount(() => window.removeEventListener('hashchange', onHashChange))

  const name = computed<PeriodName>(() => forced.value ?? periodOf(moment.value))
  const palette = computed(() => PALETTES[name.value])

  return { moment, name, palette }
}
