<script setup lang="ts">
import { site } from '@/config/site'

const isExternal = (url: string) => /^https?:/.test(url)
</script>

<template>
  <nav class="social" aria-label="社交账号">
    <a
      v-for="item in site.social"
      :key="item.name"
      class="item"
      :href="item.url"
      :target="isExternal(item.url) ? '_blank' : undefined"
      :rel="isExternal(item.url) ? 'noopener noreferrer' : undefined"
      :aria-label="item.name"
    >
      <component :is="item.icon" class="icon" aria-hidden="true" />
      <span class="tip" aria-hidden="true">{{ item.tip }}</span>
    </a>
  </nav>
</template>

<style scoped>
.social {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
}

.item {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  color: var(--ink-faint);
  transition:
    color 0.35s var(--ease),
    background-color 0.35s var(--ease);
}

.item::after {
  content: '';
  position: absolute;
  inset: -2px;
}

.icon {
  width: 1.15rem;
  height: 1.15rem;
}

.item:hover,
.item:focus-visible {
  color: var(--ink);
  background: var(--veil);
}

.tip {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  translate: -50% -4px;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--veil-strong);
  box-shadow: var(--glow);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  font-size: 0.76rem;
  color: var(--ink-soft);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  filter: blur(4px);
  transition:
    opacity 0.3s var(--ease),
    translate 0.3s var(--ease),
    filter 0.3s var(--ease);
}

.item:hover .tip,
.item:focus-visible .tip {
  opacity: 1;
  translate: -50% 0;
  filter: none;
}

@media (hover: none) {
  .tip {
    display: none;
  }
}
</style>
