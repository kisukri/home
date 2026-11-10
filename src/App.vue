<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { site } from '@/config/site'
import { usePeriod } from '@/composables/usePeriod'
import { useBoot } from '@/composables/useBoot'
import { useTheme } from '@/composables/useTheme'
import SkyScene from '@/components/scene/SkyScene.vue'
import TopLine from '@/components/hero/TopLine.vue'
import SignatureName from '@/components/hero/SignatureName.vue'
import SocialRow from '@/components/hero/SocialRow.vue'
import LinkShelf from '@/components/content/LinkShelf.vue'
import QuoteLine from '@/components/content/QuoteLine.vue'
import IntroRotator from '@/components/content/IntroRotator.vue'
import SiteFooter from '@/components/footer/SiteFooter.vue'

const ContextNotice = defineAsyncComponent(() => import('@/components/scene/ContextNotice.vue'))
const SoftCursor = defineAsyncComponent(() => import('@/components/scene/SoftCursor.vue'))

const { moment, name, palette } = usePeriod()
const { ready, markBackgroundReady } = useBoot()
useTheme(palette)

const softCursor =
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !window.matchMedia('(forced-colors: active)').matches

const rightClicks = ref(0)
function blockContextMenu(e: MouseEvent) {
  e.preventDefault()
  rightClicks.value++
}
onMounted(() => document.addEventListener('contextmenu', blockContextMenu))
onBeforeUnmount(() => document.removeEventListener('contextmenu', blockContextMenu))
</script>

<template>
  <SkyScene :palette="palette" :moment="moment" :period="name" @ready="markBackgroundReady" />

  <div class="page" :class="{ booting: !ready }">
    <main class="stage">
      <header class="hero">
        <TopLine class="reveal" style="--i: 0" :palette="palette" :moment="moment" />
        <SignatureName class="name" :label="site.name" />
        <SocialRow class="social reveal" style="--i: 3" />
      </header>

      <LinkShelf class="reveal" style="--i: 4">
        <template #aside>
          <QuoteLine class="quote" />
        </template>
      </LinkShelf>

      <IntroRotator class="tagline reveal" style="--i: 5" />
    </main>

    <SiteFooter class="reveal" style="--i: 6" />
  </div>

  <ContextNotice v-if="rightClicks" :count="rightClicks" />
  <SoftCursor v-if="softCursor" />
</template>

<style scoped>
.page.booting :deep(*) {
  animation-play-state: paused !important;
}

.page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: clip;
}

.stage {
  flex: 1;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: clamp(20px, 4vh, 72px) 24px clamp(20px, 7vh, 96px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 4.6vh, 60px);
  text-align: center;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 2vh, 26px);
}

.name {
  margin: 4px 0 0;
}

.social {
  margin-top: clamp(8px, 1.6vh, 22px);
}

.tagline {
  margin-top: calc(-1 * clamp(4px, 1.4vh, 18px));
}

.quote {
  flex: 0 1 auto;
  min-width: 0;
}

@media (max-width: 900px) {
  .stage {
    padding-top: 44px;
    gap: 36px;
  }

  .quote {
    flex: none;
    max-width: 420px;
  }
}
</style>
