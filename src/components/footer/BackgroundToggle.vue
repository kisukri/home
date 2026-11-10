<script setup lang="ts">
import { computed } from 'vue'
import { useBackground } from '@/composables/useBackground'
import PhImage from '~icons/ph/image-duotone'
import PhSunHorizon from '~icons/ph/sun-horizon-duotone'

const { mode, photoFailed, toggle } = useBackground()
const label = computed(() => {
  if (mode.value !== 'bing') return '背景：天空（点击切换为每日 Bing 壁纸）'
  return photoFailed.value ? '每日 Bing 壁纸加载失败（点击切换回天空）' : '背景：每日 Bing 壁纸（点击切换为天空）'
})
</script>

<template>
  <button class="toggle" type="button" :title="label" :aria-label="label" @click="toggle">
    <PhSunHorizon v-if="mode === 'bing'" aria-hidden="true" />
    <PhImage v-else aria-hidden="true" />
  </button>
</template>

<style scoped>
.toggle {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 1.6rem;
  height: 1.6rem;
  margin: -0.4rem 0;
  border-radius: 50%;
  color: var(--ink-faint);
  transition:
    color 0.3s var(--ease),
    background-color 0.3s var(--ease);
}

.toggle::after {
  content: '';
  position: absolute;
  inset: -0.6rem;
}

.toggle:hover,
.toggle:focus-visible {
  color: var(--ink);
  background: var(--veil);
}

.toggle svg {
  width: 0.95rem;
  height: 0.95rem;
}
</style>
