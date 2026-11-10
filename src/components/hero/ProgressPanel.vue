<script setup lang="ts">
import { computed } from 'vue'
import { site } from '@/config/site'
import { useNow } from '@/composables/useNow'
import { formatClock, formatDays, formatYearsDays, spans } from '@/utils/time'

const now = useNow('second')

const opened = computed(() => formatYearsDays(new Date(`${site.since}T00:00:00`), now.value))
const rows = computed(() =>
  spans(now.value).map((s) => ({
    ...s,
    text: s.key === 'day' ? formatClock(s.elapsed) : formatDays(s.elapsed),
    pct: Math.floor(s.ratio * 100),
  })),
)
</script>

<template>
  <div>
    <p class="title" lang="en">Time passed</p>
    <ul>
      <li v-for="r in rows" :key="r.key">
        <span class="label">{{ r.label }}</span>
        <span class="elapsed">{{ r.text }}</span>
        <span class="pct">{{ r.pct }}%</span>
        <span class="track" aria-hidden="true">
          <span class="fill" :style="{ transform: `scaleX(${r.ratio})` }" />
        </span>
      </li>
    </ul>
    <p class="since">
      <span class="label">開設から</span>
      <span class="elapsed">{{ opened }}</span>
    </p>
  </div>
</template>

<style scoped>
.since {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 18px 0 0;
}

.title {
  margin: 0 0 12px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--ink-soft);
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
}

li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 4px 12px;
}

.label {
  font-family: var(--font-jp-serif);
  font-size: 0.86rem;
  color: var(--ink);
}

.elapsed {
  font-family: var(--font-jp-sans);
  font-size: 0.82rem;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}

.pct {
  font-size: 0.78rem;
  color: var(--ink-faint);
  font-variant-numeric: tabular-nums;
}

.track {
  grid-column: 1 / -1;
  height: 6px;
  border-radius: 999px;
  background: rgb(127 127 127 / 0.16);
  overflow: hidden;
}

.fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 55%, transparent), var(--accent));
  transform-origin: left;
  transition: transform 0.8s var(--ease);
}
</style>
