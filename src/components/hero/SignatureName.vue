<script setup lang="ts">
import { signature } from '@/assets/signature'

defineProps<{ label: string }>()

const TIMING = [
  { delay: 0.35, duration: 0.55 },
  { delay: 1.03, duration: 1.35 },
]

const layers = [
  { name: 'glow', width: signature.strokeWidth + 20 },
  { name: 'feather', width: signature.strokeWidth + 9 },
  { name: 'ink', width: signature.strokeWidth },
]

const timing = (i: number) => ({
  animationDelay: `${TIMING[i]?.delay ?? 0}s`,
  animationDuration: `${TIMING[i]?.duration ?? 1}s`,
})
</script>

<template>
  <h1 class="signature">
    <span class="sr-only">{{ label }}</span>
    <svg :viewBox="signature.viewBox" aria-hidden="true">
      <defs>
        <filter id="signature-glow" x="-10%" y="-25%" width="120%" height="150%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>
      <g
        v-for="layer in layers"
        :key="layer.name"
        :class="layer.name"
        :filter="layer.name === 'glow' ? 'url(#signature-glow)' : undefined"
      >
        <path
          v-for="(d, i) in signature.strokes"
          :key="i"
          class="stroke"
          :d="d"
          pathLength="1"
          :stroke-width="layer.width"
          :style="timing(i)"
        />
      </g>
    </svg>
  </h1>
</template>

<style scoped>
.signature {
  margin: 0;
  line-height: 0;
}

svg {
  display: block;
  width: clamp(240px, min(40vw, 54vh), 36rem);
  height: auto;
  overflow: visible;
  color: var(--ink);
  transition: color 2s var(--ease);
}

.stroke {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  shape-rendering: geometricPrecision;
  animation-name: write;
  animation-timing-function: cubic-bezier(0.5, 0.1, 0.4, 1);
  animation-fill-mode: forwards;
}

.glow .stroke {
  stroke: var(--sig-glow);
}

.feather {
  opacity: var(--sig-feather);
}

@keyframes write {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
