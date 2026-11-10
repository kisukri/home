import { onMounted, ref } from 'vue'

const MIN_MS = 400
const MAX_MS = 5000
const LEAVE_MS = 800

export function useBoot() {
  const ready = ref(false)

  let resolveBackground: () => void = () => {}
  const background = new Promise<void>((resolve) => (resolveBackground = resolve))

  function finish() {
    if (ready.value) return
    ready.value = true
    const boot = document.getElementById('boot')
    boot?.classList.add('leave')
    setTimeout(
      () => {
        boot?.remove()
        document.getElementById('boot-style')?.remove()
        document.getElementById('boot-script')?.remove()
      },
      boot ? LEAVE_MS : 0,
    )
  }

  onMounted(() => {
    const minimum = new Promise((resolve) => setTimeout(resolve, MIN_MS))
    const fonts = document.fonts
      ? document.fonts.load('italic 300 1em "Crimson Pro"').catch(() => undefined)
      : Promise.resolve()
    Promise.all([minimum, fonts, background]).then(finish)
    setTimeout(finish, MAX_MS)
  })

  return { ready, markBackgroundReady: () => resolveBackground() }
}
