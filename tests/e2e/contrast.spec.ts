import { expect, ready, test } from './fixtures'

const TEXT = 4.5
const GRAPHIC = 3
const TARGETS: [name: string, selector: string, minimum: number][] = [
  ['greeting', '.top .hello', TEXT],
  ['date', '.top .day', TEXT],
  ['social icon', '.social .item .icon', GRAPHIC],
  ['quote', '.quote .text', TEXT],
  ['quote source', '.quote .from', TEXT],
  ['idle tab', '.tabs button:not(.on)', TEXT],
  ['link name', '.grid .name', TEXT],
  ['intro', '.intro', TEXT],
  ['footer', '.footer > span', TEXT],
  ['footer link', '.footer > a', TEXT],
  ['background toggle', '.toggle svg', GRAPHIC],
]

const PERIODS = ['night', 'dawn', 'day', 'dusk', 'evening']
const VIEWPORTS = [
  { width: 1280, height: 800 },
  { width: 390, height: 780 },
]

for (const viewport of VIEWPORTS) {
  for (const period of PERIODS) {
    test(`text stays readable at ${period}, ${viewport.width}px wide`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto(`/?period=${period}`)
      await ready(page)
      await page.addStyleTag({ content: '.motes { display: none !important }' })
      await page.waitForTimeout(2500)

      const items = await page.evaluate((targets) => {
        return targets.map(([name, selector, minimum]) => {
          const el = document.querySelector(selector)
          if (!el) throw new Error(`missing ${selector}`)
          const rect = el.getBoundingClientRect()
          let opacity = 1
          for (let node: Element | null = el; node; node = node.parentElement) {
            opacity *= Number(getComputedStyle(node).opacity)
          }
          return {
            name,
            minimum,
            color: getComputedStyle(el).color,
            opacity,
            rect: [rect.left, rect.top, rect.width, rect.height],
          }
        })
      }, TARGETS)

      await page.addStyleTag({
        content:
          '.page * { color: transparent !important; transition: none !important } .page svg { visibility: hidden !important }',
      })
      const shot = (await page.screenshot()).toString('base64')

      const results = await page.evaluate(
        async ({ shot, items }) => {
          const image = new Image()
          image.src = `data:image/png;base64,${shot}`
          await image.decode()
          const canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          const context = canvas.getContext('2d')!
          context.drawImage(image, 0, 0)

          const channel = (v: number) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)
          const luminance = (r: number, g: number, b: number) =>
            0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

          return items.map((item) => {
            const [r, g, b, a = 1] = item.color.match(/[\d.]+/g)!.map(Number) as [number, number, number, number?]
            const alpha = a * item.opacity
            const [x, y, width, height] = item.rect as [number, number, number, number]
            const ratios: number[] = []
            for (let i = 1; i <= 9; i++) {
              const pixel = context.getImageData(
                Math.round(x + (width * i) / 10),
                Math.round(y + height / 2),
                1,
                1,
              ).data
              const [pr, pg, pb] = [pixel[0]!, pixel[1]!, pixel[2]!]
              const fg = luminance(
                r * alpha + pr * (1 - alpha),
                g * alpha + pg * (1 - alpha),
                b * alpha + pb * (1 - alpha),
              )
              const bg = luminance(pr, pg, pb)
              ratios.push((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05))
            }
            ratios.sort((p, q) => p - q)
            return { name: item.name, minimum: item.minimum, ratio: Number(ratios[2]!.toFixed(2)) }
          })
        },
        { shot, items },
      )

      expect(results.filter((result) => result.ratio < result.minimum)).toEqual([])
    })
  }
}
