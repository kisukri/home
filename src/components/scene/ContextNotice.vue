<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ count: number }>()

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.count,
  () => {
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (visible.value = false), 2000)
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Transition name="drop">
    <div v-if="visible" class="notice" role="status" lang="ja">
      <span class="dot" aria-hidden="true" />
      <span class="ja">右クリックは使えません</span>
      <span class="en" lang="en">Right-click is disabled</span>
    </div>
  </Transition>
</template>

<style scoped>
.notice {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 22px);
  left: 50%;
  translate: -50% 0;
  z-index: 150;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px 10px 16px;
  border-radius: 999px;
  background: var(--panel);
  box-shadow: var(--glow);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  white-space: nowrap;
  pointer-events: none;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.ja {
  font-family: var(--font-jp-sans);
  font-size: 0.85rem;
  color: var(--ink);
}

.en {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--ink-faint);
}

.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.35s var(--ease),
    transform 0.35s var(--ease);
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
