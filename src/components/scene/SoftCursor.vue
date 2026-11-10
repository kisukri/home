<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const visible = ref(false)
const hovering = ref(false)
const pressed = ref(false)
const dot = ref<HTMLElement | null>(null)
const halo = ref<HTMLElement | null>(null)

const FOLLOW = 0.2

let x = 0
let y = 0
let hx = 0
let hy = 0
let frame = 0
let active = false

function loop() {
  hx += (x - hx) * FOLLOW
  hy += (y - hy) * FOLLOW
  const settled = Math.abs(x - hx) < 0.1 && Math.abs(y - hy) < 0.1
  if (settled) {
    hx = x
    hy = y
  }
  if (dot.value) dot.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
  if (halo.value) halo.value.style.transform = `translate3d(${hx}px, ${hy}px, 0)`
  frame = settled ? 0 : requestAnimationFrame(loop)
}

function onMove(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  x = e.clientX
  y = e.clientY
  if (!active) {
    active = true
    document.documentElement.classList.add('soft-cursor')
  }
  if (!visible.value) {
    hx = x
    hy = y
    visible.value = true
  }
  hovering.value = !!(e.target as Element | null)?.closest?.('a, button, [role="tab"]')
  if (!frame) frame = requestAnimationFrame(loop)
}

const onLeave = () => (visible.value = false)
const onDown = () => (pressed.value = true)
const onUp = () => (pressed.value = false)

onMounted(() => {
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  document.documentElement.addEventListener('mouseleave', onLeave)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  document.documentElement.classList.remove('soft-cursor')
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerdown', onDown)
  window.removeEventListener('pointerup', onUp)
  document.documentElement.removeEventListener('mouseleave', onLeave)
})
</script>

<template>
  <div class="cursor" :class="{ visible, hovering, pressed }" aria-hidden="true">
    <span ref="halo" class="halo"><span /></span>
    <span ref="dot" class="dot"><span /></span>
  </div>
</template>

<style scoped>
.cursor {
  position: fixed;
  inset: 0;
  z-index: 300;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s var(--ease);
}

.cursor.visible {
  opacity: 1;
}

.halo,
.dot {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.halo > span,
.dot > span {
  position: absolute;
  border-radius: 50%;
  translate: -50% -50%;
  transition:
    width 0.35s var(--ease),
    height 0.35s var(--ease),
    background-color 0.35s var(--ease),
    opacity 0.35s var(--ease);
}

.dot > span {
  width: 6px;
  height: 6px;
  background: var(--ink);
}

.halo > span {
  width: 22px;
  height: 22px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--ink) 22%, transparent) 0%,
    color-mix(in srgb, var(--ink) 8%, transparent) 60%,
    transparent 72%
  );
}

.hovering .halo > span {
  width: 32px;
  height: 32px;
  opacity: 0.8;
}

.hovering .dot > span {
  width: 4px;
  height: 4px;
}

.pressed .halo > span {
  width: 16px;
  height: 16px;
}
</style>
