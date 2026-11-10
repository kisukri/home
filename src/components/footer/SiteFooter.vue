<script setup lang="ts">
import { site } from '@/config/site'
import BackgroundToggle from './BackgroundToggle.vue'

const year = new Date().getFullYear()
const since = Number(site.since.slice(0, 4))
const range = since && since < year ? `${since} – ${year}` : String(year)

const icpLink = site.icp.startsWith('萌')
  ? `https://icp.gov.moe/?keyword=${site.icp.replace(/\D/g, '')}`
  : 'https://beian.miit.gov.cn/'
</script>

<template>
  <footer class="footer">
    <span
      >© {{ range }} <a :href="site.url">{{ site.author }}</a></span
    >
    <a v-if="site.icp" :href="icpLink" target="_blank" rel="noopener noreferrer">{{ site.icp }}</a>
    <BackgroundToggle />
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 18px;
  padding: 20px 16px calc(28px + env(safe-area-inset-bottom));
  font-size: 0.72rem;
  color: var(--ink-low);
  letter-spacing: 0.04em;
  text-shadow: var(--text-shadow);
}

a {
  border-radius: 999px;
  transition: color 0.3s var(--ease);
}

a:hover {
  color: var(--ink);
}
</style>
