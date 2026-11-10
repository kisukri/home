import { ref } from 'vue'
import { site } from '@/config/site'

export type BackgroundMode = 'sky' | 'bing'

const STORAGE_KEY = 'alue:background'

function readSaved(): BackgroundMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'sky' || saved === 'bing') return saved
  } catch {}
  return site.background
}

const mode = ref<BackgroundMode>(readSaved())
const photoShown = ref(false)
const photoFailed = ref(false)

export function useBackground() {
  function toggle() {
    mode.value = mode.value === 'bing' ? 'sky' : 'bing'
    try {
      localStorage.setItem(STORAGE_KEY, mode.value)
    } catch {}
  }

  return { mode, photoShown, photoFailed, toggle }
}
