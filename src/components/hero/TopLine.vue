<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@/composables/useNow'
import { useWeather } from '@/composables/useWeather'
import { jpDate, sekkiToday } from '@/utils/koyomi'
import { greetingOf, type Palette } from '@/utils/period'
import ProgressClock from './ProgressClock.vue'

const props = defineProps<{ palette: Palette; moment: Date }>()

const now = useNow()
const { weather } = useWeather()

const hello = computed(() => greetingOf(props.moment))
const day = computed(() => jpDate(now.value))
const sekki = computed(() => sekkiToday(now.value))
</script>

<template>
  <div class="top" lang="ja">
    <span class="hello">{{ hello }}</span>
    <span class="period" :title="palette.en">{{ palette.label }}</span>
    <span class="day">
      {{ day }}<span v-if="sekki" class="sekki">{{ sekki }}</span>
    </span>
    <span class="break" aria-hidden="true" />
    <Transition name="appear">
      <span
        v-if="weather"
        class="weather"
        :title="`${weather.city}　湿度 ${weather.humidity}%　最低 ${weather.min}℃ / 最高 ${weather.max}℃`"
      >
        <component :is="weather.icon" class="w-icon" aria-hidden="true" />
        {{ weather.text }} {{ weather.temp }}℃
      </span>
    </Transition>
    <ProgressClock class="clock" />
  </div>
</template>

<style scoped>
.top {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  row-gap: 4px;
  font-size: 0.9rem;
  color: var(--ink-soft);
  text-shadow: var(--text-shadow);
}

.top > * + :not(.break)::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  margin: 0 14px;
  border-radius: 50%;
  background: var(--ink-faint);
  vertical-align: 0.3em;
}

.break {
  display: none;
  flex-basis: 100%;
  height: 0;
}

@media (max-width: 600px) {
  .break {
    display: block;
  }

  .top > .break + *::before {
    display: none;
  }
}

.hello {
  margin-right: -0.24em;
  font-family: var(--font-jp-serif);
  letter-spacing: 0.24em;
}

.sekki {
  margin-left: 0.6em;
  font-family: var(--font-jp-serif);
  color: var(--ink);
}

.period {
  font-family: var(--font-jp-serif);
  font-size: 1.1rem;
  color: var(--ink);
}

.day,
.weather {
  font-family: var(--font-jp-sans);
  font-size: 0.85rem;
}

.w-icon {
  width: 1.1em;
  height: 1.1em;
  margin-right: 0.3em;
  vertical-align: -0.18em;
}

.appear-enter-active {
  transition: opacity 0.8s var(--ease);
}

.appear-enter-from {
  opacity: 0;
}
</style>
