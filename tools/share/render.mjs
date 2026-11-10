import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const base = process.argv[2] ?? 'http://localhost:4173/'
const out = (name) => fileURLToPath(new URL(`../../public/${name}`, import.meta.url))

const { background_color: background } = await (await fetch(new URL('site.webmanifest', base))).json()

const browser = await chromium.launch()

const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort())
await page.goto(`${base}#dusk`)
await page.addStyleTag({
  content: '.top, .social, .shelf, .footer, .cursor { display: none !important } .stage { gap: 40px !important }',
})
await page.waitForTimeout(6000)
await page.screenshot({ path: out('og.jpg'), type: 'jpeg', quality: 88 })
await page.close()

const favicon = await readFile(out('favicon.svg'), 'utf8')
for (const [name, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  const icon = await browser.newPage({ viewport: { width: size, height: size } })
  await icon.setContent(
    `<body style="margin:0;display:grid;place-items:center;height:100vh;background:${background}"><div style="width:68%">${favicon}</div>`,
  )
  await icon.screenshot({ path: out(name) })
  await icon.close()
}

await browser.close()
