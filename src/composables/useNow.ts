import { onBeforeUnmount, onMounted, shallowRef, type ShallowRef } from 'vue'

export type Precision = 'second' | 'minute'

const STEP: Record<Precision, number> = { second: 1000, minute: 60_000 }

function createClock(step: number) {
  const now = shallowRef(new Date())
  let users = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  function tick() {
    now.value = new Date()
    timer = setTimeout(tick, step - (Date.now() % step))
  }

  return {
    now,
    acquire: () => {
      if (users++ === 0) tick()
    },
    release: () => {
      if (--users === 0) clearTimeout(timer)
    },
  }
}

const clocks: Record<Precision, ReturnType<typeof createClock>> = {
  second: createClock(STEP.second),
  minute: createClock(STEP.minute),
}

export function useNow(precision: Precision = 'minute'): ShallowRef<Date> {
  const clock = clocks[precision]
  onMounted(clock.acquire)
  onBeforeUnmount(clock.release)
  return clock.now
}
