<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHitokoto } from '@/composables/useHitokoto'

const { quote, loading, refresh } = useHitokoto()

const long = computed(() => (quote.value?.text.length ?? 0) > 32)

const announce = ref(false)
function next() {
  announce.value = true
  refresh()
}
</script>

<template>
  <button
    class="quote"
    :class="{ long, loading }"
    type="button"
    :title="quote ? `${quote.text}　—— ${quote.from}\n点一下，换一句` : '点一下，换一句'"
    :aria-busy="loading"
    @click="next"
  >
    <span class="live" :aria-live="announce ? 'polite' : 'off'">
      <Transition name="soft" mode="out-in">
        <span v-if="quote" :key="quote.text" class="body">
          <span class="text"><span class="mark" aria-hidden="true">“</span>{{ quote.text }}</span>
          <span class="from">{{ quote.from }}</span>
          <span class="sr-only">（点一下，换一句）</span>
        </span>
        <span v-else class="body placeholder">&nbsp;</span>
      </Transition>
    </span>
  </button>
</template>

<style scoped>
.quote {
  display: flex;
  justify-content: flex-end;
  width: fit-content;
  max-width: calc(100% + 28px);
  padding: 8px 14px;
  margin: -8px -14px -8px auto;
  border-radius: 18px;
  text-align: right;
  text-shadow: var(--text-shadow);
  transition: background-color 0.4s var(--ease);
}

.quote:hover {
  background: var(--veil);
}

.live {
  display: contents;
}

.body {
  transition: opacity 0.3s var(--ease);
}

.loading .body {
  opacity: 0.55;
}

.body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
  min-height: calc(0.92rem * 1.6 * 2 + 0.72rem * 1.6 + 2px);
}

.text {
  font-family: var(--font-cn-serif);
  font-size: 0.92rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  color: var(--ink-soft);
  letter-spacing: 0.04em;
  word-break: keep-all;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.mark {
  margin-right: 0.3em;
  font-family: var(--font-serif);
  font-size: 1.5em;
  line-height: 0;
  vertical-align: -0.28em;
  color: var(--accent);
  opacity: 0.7;
}

.long .text {
  font-size: 0.82rem;
}

@media (max-height: 780px) {
  .text {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}

.from {
  font-size: 0.72rem;
  color: var(--ink-faint);
  letter-spacing: 0.1em;
}

@media (max-width: 900px) {
  .quote {
    justify-content: center;
    text-align: center;
    margin: -8px auto;
  }

  .body {
    align-items: center;
  }
}

.soft-enter-active,
.soft-leave-active {
  transition:
    opacity 0.5s var(--ease),
    filter 0.5s var(--ease);
}

.soft-enter-from,
.soft-leave-to {
  opacity: 0;
  filter: blur(6px);
}
</style>
