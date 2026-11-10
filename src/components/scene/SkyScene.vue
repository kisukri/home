<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { site } from '@/config/site'
import { celestialPosition, type Palette, type PeriodName } from '@/utils/period'
import { useBackground } from '@/composables/useBackground'

const props = defineProps<{ palette: Palette; moment: Date; period: PeriodName }>()
const emit = defineEmits<{ ready: [] }>()

const { mode, photoShown, photoFailed } = useBackground()
const wanted = computed(() => (mode.value === 'bing' ? site.bingApi : site.backgrounds[props.period]))
const image = ref<string | null>(null)
const covered = ref(false)
watch(image, (src) => (photoShown.value = src !== null && src === site.bingApi))
watch(
  wanted,
  (src) => {
    photoFailed.value = false
    if (!src) {
      image.value = null
      emit('ready')
      return
    }
    const img = new Image()
    img.onload = () => {
      if (wanted.value === src) image.value = src
      emit('ready')
    }
    img.onerror = () => {
      if (wanted.value === src) photoFailed.value = true
      emit('ready')
    }
    img.src = src
  },
  { immediate: true },
)

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const W = 1600
const H = 420
function ridge(seed: number, base: number, amp: number) {
  const r = rng(seed)
  const waves = Array.from({ length: 4 }, (_, i) => ({
    f: (0.6 + r() * 0.8) * (i + 1) * 0.0024,
    p: r() * Math.PI * 2,
    a: amp / (i + 1.2),
  }))
  const pts: [number, number][] = []
  for (let x = -40; x <= W + 40; x += 40) {
    const y = base - waves.reduce((s, w) => s + Math.sin(x * w.f + w.p) * w.a, 0)
    pts.push([x, y])
  }
  let d = `M ${pts[0]![0]} ${H} L ${pts[0]![0]} ${pts[0]![1]}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i]!
    const [nx, ny] = pts[i + 1]!
    d += ` Q ${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`
  }
  const last = pts[pts.length - 1]!
  d += ` L ${last[0]} ${last[1]} L ${last[0]} ${H} Z`
  return d
}

const PHOTO_SCRIM = 0.3

const RIDGES = [ridge(7, 150, 60), ridge(21, 215, 52), ridge(42, 285, 42), ridge(99, 350, 28)]

const STAR_LAYERS = (() => {
  const r = rng(2024)
  const stars = Array.from({ length: 170 }, () => ({
    x: r() * 100,
    y: r() * 60,
    s: r() < 0.92 ? 0.8 + r() * 0.9 : 1.6 + r() * 1,
  }))
  const layers = [
    { t: 3.2, d: 0 },
    { t: 4.1, d: 1.3 },
    { t: 5, d: 2.9 },
    { t: 5.9, d: 0.7 },
    { t: 6.8, d: 4.2 },
    { t: 7.7, d: 2.1 },
  ]
  return layers.map((layer, i) => ({
    ...layer,
    shadow: stars
      .filter((_, n) => n % layers.length === i)
      .map((s) => `${s.x.toFixed(2)}vw ${s.y.toFixed(2)}vh 0 ${((s.s - 1) / 2).toFixed(2)}px #fff`)
      .join(','),
  }))
})()

const CLOUDS = [
  { top: 10, left: -8, w: 42, h: 3.2, o: 0.8, dur: 160, delay: 0 },
  { top: 17, left: 52, w: 34, h: 2.4, o: 0.7, dur: 190, delay: -70 },
  { top: 27, left: 18, w: 48, h: 2.8, o: 0.6, dur: 220, delay: -40 },
  { top: 36, left: 64, w: 38, h: 2, o: 0.55, dur: 200, delay: -110 },
  { top: 46, left: -4, w: 56, h: 1.6, o: 0.5, dur: 240, delay: -150 },
  { top: 52, left: 46, w: 44, h: 1.3, o: 0.45, dur: 260, delay: -20 },
]

const MOTES = (() => {
  const r = rng(77)
  return Array.from({ length: 12 }, () => ({
    x: r() * 100,
    y: 45 + r() * 50,
    s: 1.5 + r() * 2,
    d: r() * -20,
    t: 14 + r() * 16,
  }))
})()

const body = computed(() => celestialPosition(props.moment, props.palette.body))

const skyStyle = computed(() => {
  const [top, mid, horizon] = props.palette.sky
  return { background: `linear-gradient(to bottom, ${top} 0%, ${mid} 48%, ${horizon} 78%)` }
})
</script>

<template>
  <div class="scene" aria-hidden="true">
    <template v-if="!covered">
      <div class="sky" :style="skyStyle" />

      <div v-if="palette.stars > 0" class="stars" :style="{ opacity: palette.stars }">
        <span
          v-for="(layer, i) in STAR_LAYERS"
          :key="i"
          :style="{ boxShadow: layer.shadow, animationDelay: `${-layer.d}s`, animationDuration: `${layer.t}s` }"
        />
      </div>

      <div
        class="horizon"
        :style="{
          background: `radial-gradient(ellipse 70% 32% at ${body.x}% 62%, ${palette.glow} 0%, transparent 72%)`,
        }"
      />

      <div
        class="halo"
        :style="{
          left: `${body.x}%`,
          top: `${body.y}%`,
          background: `radial-gradient(circle, ${palette.glow} 0%, transparent 60%)`,
        }"
      />
      <div
        class="body"
        :class="palette.body"
        :style="{
          left: `${body.x}%`,
          top: `${body.y}%`,
          background: palette.bodyColor,
          boxShadow: `0 0 36px 8px ${palette.glow}`,
        }"
      />

      <div class="clouds">
        <span
          v-for="(c, i) in CLOUDS"
          :key="i"
          class="cloud"
          :style="{
            top: `${c.top}%`,
            left: `${c.left}%`,
            width: `${c.w}vw`,
            height: `${c.h}vw`,
            background: palette.cloud,
            opacity: c.o,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }"
        />
      </div>

      <svg class="range" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" :stop-color="palette.mist" stop-opacity="0" />
            <stop offset="0.6" :stop-color="palette.mist" />
            <stop offset="1" :stop-color="palette.mist" stop-opacity="0" />
          </linearGradient>
        </defs>
        <defs>
          <linearGradient v-for="(c, i) in palette.mountains" :id="`ridge-${i}`" :key="i" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" :style="{ stopColor: `color-mix(in srgb, ${c} ${62 + i * 8}%, ${palette.sky[2]})` }" />
            <stop offset="0.45" :style="{ stopColor: c }" />
            <stop offset="1" :style="{ stopColor: `color-mix(in srgb, ${c} 82%, #000)` }" />
          </linearGradient>
        </defs>
        <template v-for="(d, i) in RIDGES" :key="i">
          <path :d="d" :fill="`url(#ridge-${i})`" :class="`ridge r${i}`" />
          <rect v-if="i < 3" x="-40" :y="100 + i * 70" :width="W + 80" height="150" fill="url(#mist)" class="mist" />
        </template>
      </svg>

      <div v-if="palette.theme !== 'light'" class="motes">
        <span
          v-for="(m, i) in MOTES"
          :key="i"
          :style="{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: `${m.s}px`,
            height: `${m.s}px`,
            background: palette.mote,
            boxShadow: `0 0 ${m.s * 3}px ${palette.mote}`,
            animationDelay: `${m.d}s`,
            animationDuration: `${m.t}s`,
          }"
        />
      </div>
    </template>

    <Transition name="photo" @after-enter="covered = true" @before-leave="covered = false">
      <div v-if="image" :key="image" class="photo">
        <img :src="image" alt="" decoding="async" />
      </div>
    </Transition>

    <div class="veil" :style="{ '--scrim': image ? PHOTO_SCRIM : palette.scrim }" />
    <div class="grain" />
  </div>
</template>

<style scoped>
@property --scrim {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

.scene {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: var(--base);
}

.sky,
.horizon,
.stars,
.clouds,
.motes,
.veil,
.grain,
.photo {
  position: absolute;
  inset: 0;
}

.sky {
  transition: background 2s var(--ease);
}

.stars {
  transition: opacity 2s var(--ease);
}

.stars span {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  border-radius: 50%;
  animation: twinkle ease-in-out infinite alternate;
}

@keyframes twinkle {
  from {
    opacity: 0.25;
  }
  to {
    opacity: 1;
  }
}

.horizon {
  opacity: 0.75;
}

.halo {
  position: absolute;
  width: 46vmax;
  height: 46vmax;
  opacity: 0.6;
  translate: -50% -50%;
  border-radius: 50%;
  pointer-events: none;
}

.body {
  position: absolute;
  width: clamp(30px, 2.8vw, 46px);
  aspect-ratio: 1;
  translate: -50% -50%;
  border-radius: 50%;
  opacity: 0.78;
  filter: blur(2.5px);
}

.body.moon {
  width: clamp(26px, 2.3vw, 38px);
  opacity: 0.85;
  filter: blur(1px);
}

.body.moon::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 40%, rgb(150 140 120 / 0.22) 0 14%, transparent 22%),
    radial-gradient(circle at 62% 62%, rgb(150 140 120 / 0.18) 0 10%, transparent 18%),
    radial-gradient(circle at 60% 30%, rgb(150 140 120 / 0.12) 0 7%, transparent 13%);
}

.cloud {
  position: absolute;
  border-radius: 50%;
  filter: blur(22px);
  animation: sail linear infinite alternate;
}

@keyframes sail {
  from {
    transform: translateX(-12vw);
  }
  to {
    transform: translateX(18vw);
  }
}

.range {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 46vh;
  min-height: 260px;
}

.ridge {
  transition: fill 2s var(--ease);
}

.r0 {
  filter: blur(3px);
}

.r1 {
  filter: blur(1.6px);
}

.r2 {
  filter: blur(0.8px);
}

.motes {
  opacity: 0.8;
}

.motes span {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  animation: float ease-in-out infinite;
}

@keyframes float {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }
  20% {
    opacity: 0.85;
  }
  80% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
    transform: translate(3vw, -18vh);
  }
}

.photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgb(8 10 28 / 0.45), rgb(8 10 28 / 0.2) 45%, rgb(8 10 28 / 0.55));
}

.photo-leave-active {
  transition: opacity 1.6s var(--ease);
}

.photo-leave-to {
  opacity: 0;
}

.photo-enter-active {
  transition:
    opacity 1.6s var(--ease),
    filter 1.6s var(--ease),
    transform 1.6s var(--ease);
}

.photo-enter-from {
  opacity: 0;
  filter: blur(30px);
  transform: scale(1.06);
}

.veil {
  transition: --scrim 2s var(--ease);
  background:
    radial-gradient(ellipse 54% 38% at 50% 67%, rgb(8 10 30 / var(--scrim)) 0% 30%, transparent 100%),
    radial-gradient(ellipse 60% 55% at 50% 45%, var(--scene-veil) 0%, transparent 100%);
}

@media (max-width: 900px) {
  .veil {
    background:
      radial-gradient(ellipse 110% 38% at 50% 67%, rgb(8 10 30 / var(--scrim)) 0% 30%, transparent 100%),
      radial-gradient(ellipse 60% 55% at 50% 45%, var(--scene-veil) 0%, transparent 100%);
  }
}

.grain {
  opacity: 0.07;
  mix-blend-mode: overlay;
  -webkit-mask-image: radial-gradient(ellipse 34% 24% at 50% 30%, transparent 55%, #000 100%);
  mask-image: radial-gradient(ellipse 34% 24% at 50% 30%, transparent 55%, #000 100%);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>
