import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const [svgFile, outFile, width] = process.argv.slice(2)
if (!svgFile || !outFile || !Number(width)) {
  console.error('usage: node render.mjs <input.svg> <output.png> <width>')
  process.exit(1)
}

const svg = await readFile(svgFile, 'utf8')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: Number(width), height: 400 } })
await page.setContent(
  `<body style="margin:0;background:#fff">${svg.replace('<svg ', '<svg style="width:100%;display:block" ')}</body>`,
)
await page.locator('svg').screenshot({ path: outFile })
await browser.close()
