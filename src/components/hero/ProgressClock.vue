<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useNow } from '@/composables/useNow'
import { pad } from '@/utils/time'

const loadPanel = () => import('./ProgressPanel.vue')
const ProgressPanel = defineAsyncComponent(loadPanel)

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const shift = ref(0)

async function place() {
  shift.value = 0
  await nextTick()
  const rect = panel.value?.getBoundingClientRect()
  if (!rect) return
  const margin = 16
  if (rect.left < margin) shift.value = margin - rect.left
  else if (rect.right > window.innerWidth - margin) shift.value = window.innerWidth - margin - rect.right
}

watch(open, (isOpen) => {
  if (isOpen) {
    place()
    window.addEventListener('resize', place)
  } else {
    window.removeEventListener('resize', place)
  }
})
const now = useNow()

const time = computed(() => `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}`)

function onPointerDown(e: PointerEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', place)
})
</script>

<template>
  <div ref="root" class="progress-clock" lang="ja">
    <button
      class="trigger"
      type="button"
      :aria-expanded="open"
      :aria-controls="open ? 'progress-panel' : undefined"
      :aria-label="`${time}　時の進みを見る`"
      @pointerenter="loadPanel"
      @focus="loadPanel"
      @click="open = !open"
    >
      <time :datetime="time">{{ time }}</time>
    </button>

    <Transition name="pop">
      <section
        v-if="open"
        id="progress-panel"
        ref="panel"
        class="panel"
        aria-label="時の進み"
        :style="{ translate: `calc(-50% + ${shift}px) 0` }"
      >
        <ProgressPanel />
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.progress-clock {
  position: relative;
}

.trigger {
  font-size: 1.05rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  border-radius: 6px;
  transition:
    color 0.3s var(--ease),
    text-shadow 0.3s var(--ease);
}

.trigger:hover,
.trigger[aria-expanded='true'] {
  color: var(--accent);
  text-shadow: 0 0 14px color-mix(in srgb, var(--accent) 55%, transparent);
}

.panel {
  position: absolute;
  top: calc(100% + 14px);
  left: 50%;
  translate: -50% 0;
  z-index: 10;
  width: min(20rem, calc(100vw - 32px));
  padding: 18px 20px 20px;
  border-radius: 24px;
  background: var(--panel);
  box-shadow: var(--glow);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  text-align: left;
  text-shadow: none;
}

.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.35s var(--ease),
    filter 0.35s var(--ease),
    transform 0.35s var(--ease);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(-8px) scale(0.97);
}
</style>
