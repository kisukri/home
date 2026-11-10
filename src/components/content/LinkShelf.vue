<script setup lang="ts">
import { computed, ref } from 'vue'
import { site } from '@/config/site'

const groups = site.linkGroups
const active = ref(0)
const current = computed(() => groups[active.value] ?? groups[0])

const columns = Math.max(1, ...groups.map((g) => g.links.length))
const tabbed = groups.length > 1
const tablist = ref<HTMLElement | null>(null)

function onTabKey(e: KeyboardEvent) {
  const last = groups.length - 1
  const moves: Record<string, number> = {
    ArrowRight: active.value === last ? 0 : active.value + 1,
    ArrowLeft: active.value === 0 ? last : active.value - 1,
    Home: 0,
    End: last,
  }
  const next = moves[e.key]
  if (next === undefined) return
  e.preventDefault()
  active.value = next
  ;(tablist.value?.children[next] as HTMLElement | undefined)?.focus()
}
</script>

<template>
  <section class="shelf" aria-label="网站" :style="{ '--cols': columns }">
    <div class="head">
      <div v-if="tabbed" ref="tablist" class="tabs" role="tablist" aria-label="网站分组" @keydown="onTabKey">
        <button
          v-for="(g, i) in groups"
          :id="`tab-${i}`"
          :key="g.name"
          type="button"
          role="tab"
          :aria-selected="active === i"
          :tabindex="active === i ? 0 : -1"
          aria-controls="link-panel"
          :class="{ on: active === i }"
          @click="active = i"
        >
          {{ g.name }}
        </button>
      </div>
      <slot name="aside" />
    </div>

    <div
      id="link-panel"
      :role="tabbed ? 'tabpanel' : undefined"
      :aria-labelledby="tabbed ? `tab-${active}` : undefined"
    >
      <Transition name="swap" mode="out-in">
        <ul v-if="current" :key="current.name" class="grid">
          <li v-for="(link, i) in current.links" :key="link.url" :style="{ '--i': i }">
            <a class="item" :href="link.url" target="_blank" rel="noopener noreferrer">
              <span class="bubble">
                <component :is="link.icon" class="icon" aria-hidden="true" />
              </span>
              <span class="name">{{ link.name }}</span>
            </a>
          </li>
        </ul>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.shelf {
  --col: clamp(40px, 12.6vw, 4.5rem);
  --gap: clamp(6px, 2.4vw, 1.8rem);
  width: calc(var(--cols) * var(--col) + (var(--cols) - 1) * var(--gap));
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.tabs {
  flex: none;
  display: flex;
  gap: 4px;
  padding: 5px;
  border-radius: 999px;
  background: var(--veil);
}

:root[data-scene='photo'] .tabs,
:root[data-scene='photo'] .bubble {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.tabs button {
  padding: 6px 18px;
  border-radius: 999px;
  font-size: 0.86rem;
  color: var(--ink-soft);
  text-shadow: var(--text-shadow);
  transition:
    background-color 0.35s var(--ease),
    color 0.35s var(--ease),
    box-shadow 0.35s var(--ease);
}

.tabs button:hover {
  color: var(--ink);
}

.tabs button.on {
  color: var(--ink);
  text-shadow: none;
  background: var(--veil-strong);
  box-shadow: var(--glow);
}

.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--col));
  gap: var(--gap);
}

.grid li {
  animation: rise 0.6s var(--ease) both;
  animation-delay: calc(var(--i) * 0.045s);
}

@keyframes rise {
  from {
    opacity: 0;
    filter: blur(4px);
  }
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(6px, 1.6vw, 10px);
  width: var(--col);
  border-radius: 20px;
}

.bubble {
  display: grid;
  place-items: center;
  width: clamp(38px, 11vw, 3.9rem);
  height: clamp(38px, 11vw, 3.9rem);
  border-radius: 50%;
  background: var(--veil);
  transition:
    transform 0.45s var(--ease),
    background-color 0.45s var(--ease),
    box-shadow 0.45s var(--ease);
}

.icon {
  width: clamp(18px, 5vw, 1.6rem);
  height: clamp(18px, 5vw, 1.6rem);
  color: var(--ink);
  opacity: 0.82;
  transition:
    opacity 0.45s var(--ease),
    color 0.45s var(--ease);
}

.name {
  font-size: clamp(0.68rem, 2.9vw, 0.82rem);
  color: var(--ink);
  text-shadow: var(--text-shadow);
  white-space: nowrap;
  transition: color 0.45s var(--ease);
}

.item:hover .bubble,
.item:focus-visible .bubble {
  transform: translateY(-4px);
  background: var(--veil-strong);
  box-shadow: var(--glow);
}

.item:hover .icon,
.item:focus-visible .icon {
  opacity: 1;
  color: var(--accent);
}

.item:focus-visible {
  box-shadow: none;
}

.item:focus-visible .bubble {
  box-shadow: var(--ring);
}

.item:active .bubble {
  transform: scale(0.95);
}

.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.3s var(--ease),
    filter 0.3s var(--ease);
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(6px);
}

@media (max-width: 900px) {
  .shelf {
    align-self: center;
  }

  .head {
    flex-direction: column-reverse;
    gap: 22px;
  }
}
</style>
