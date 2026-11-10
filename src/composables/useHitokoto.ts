import { onMounted, ref } from 'vue'

interface Quote {
  text: string
  from: string
}

const FALLBACK: Quote = { text: '山高自有客行路，水深自有渡船人。', from: '佚名' }

export function useHitokoto() {
  const quote = ref<Quote | null>(null)
  const loading = ref(false)

  async function refresh() {
    if (loading.value) return
    loading.value = true
    try {
      const res = await fetch('https://v1.hitokoto.cn/', {
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data: { hitokoto?: unknown; from?: unknown; from_who?: unknown } = await res.json()
      if (typeof data.hitokoto !== 'string' || !data.hitokoto) throw new Error('unexpected response')
      const from = [data.from_who, data.from].find((v): v is string => typeof v === 'string' && v !== '')
      quote.value = { text: data.hitokoto, from: from ?? FALLBACK.from }
    } catch {
      quote.value = quote.value ?? FALLBACK
    } finally {
      loading.value = false
    }
  }

  onMounted(refresh)

  return { quote, loading, refresh }
}
