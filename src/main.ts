import { createApp } from 'vue'
import './styles/main.css'
import App from './App.vue'

window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'alue:reloaded'
  try {
    if (sessionStorage.getItem(KEY)) return
    sessionStorage.setItem(KEY, '1')
  } catch {
    return
  }
  event.preventDefault()
  location.reload()
})

createApp(App).mount('#app')
