<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { site } from '@/config/site'

const lines = site.intro.lines
const segments = lines.map((l) => l.match(/[^，。！？、；]*[，。！？、；]+|[^，。！？、；]+/g) ?? [l])
const index = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (lines.length > 1) {
    timer = setInterval(() => (index.value = (index.value + 1) % lines.length), 5200)
  }
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <p class="intro" :lang="site.intro.lang" aria-live="off">
    <Transition name="soft" mode="out-in">
      <span :key="index" class="line">
        <span v-for="(seg, i) in segments[index]" :key="i" class="seg">{{ seg }}</span>
      </span>
    </Transition>
  </p>
</template>

<style scoped>
.intro {
  margin: 0;
  min-height: 1.6em;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(1.25rem, 2.1vw, 1.55rem);
  color: var(--ink-soft);
  letter-spacing: 0.015em;
  text-shadow: var(--text-shadow);
  text-wrap: balance;
}

.line,
.seg {
  display: inline-block;
}

.soft-enter-active,
.soft-leave-active {
  transition:
    opacity 0.7s var(--ease),
    filter 0.7s var(--ease),
    transform 0.7s var(--ease);
}

.soft-enter-from {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(6px);
}

.soft-leave-to {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(-6px);
}
</style>
