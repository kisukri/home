import { expect, ready, test } from './fixtures'

test('link groups work as keyboard-operable tabs', async ({ page }) => {
  await page.goto('/')
  await ready(page)
  const tabs = page.getByRole('tab')
  const panel = page.getByRole('tabpanel')

  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
  await expect(panel.getByRole('listitem')).toHaveCount(6)

  await tabs.nth(0).focus()
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(1)).toBeFocused()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(tabs.nth(0)).toHaveAttribute('tabindex', '-1')
  await expect(panel.getByRole('link', { name: 'Matrix' })).toBeVisible()

  await page.keyboard.press('End')
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(0)).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(tabs.nth(2)).toBeFocused()
})

test('the clock opens a panel that ticks every second and closes on Escape', async ({ page }) => {
  await page.goto('/')
  await ready(page)
  const trigger = page.locator('.progress-clock .trigger')

  await trigger.click()
  const today = page.locator('#progress-panel li .elapsed').first()
  await expect(today).toBeVisible()
  const before = await today.textContent()
  await expect(today).not.toHaveText(before!, { timeout: 3000 })

  await page.keyboard.press('Escape')
  await expect(page.locator('#progress-panel')).toHaveCount(0)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('the quote can be refreshed and falls back when the API misbehaves', async ({ page }) => {
  await page.goto('/')
  await ready(page)
  const quote = page.locator('.quote')
  await expect(quote).toContainText('测试用的一句话。')

  await page.route('https://v1.hitokoto.cn/**', (route) => route.fulfill({ json: { unexpected: true } }))
  await quote.click()
  await expect(quote).toContainText('测试用的一句话。')
  await expect(quote).toHaveAttribute('aria-busy', 'false')
})

test.describe('custom cursor', () => {
  test('replaces the system cursor only after the mouse moves', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    await expect(page.locator('html')).not.toHaveClass(/soft-cursor/)
    await page.mouse.move(300, 300)
    await expect(page.locator('html')).toHaveClass(/soft-cursor/)
    await expect(page.locator('.cursor')).toHaveClass(/visible/)
  })

  test('is left out when the visitor prefers reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await ready(page)
    await page.mouse.move(300, 300)
    await expect(page.locator('.cursor')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveClass(/soft-cursor/)
  })

  test('is left out in forced-colors mode, where focus stays visible', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await page.goto('/')
    await ready(page)
    await expect(page.locator('.cursor')).toHaveCount(0)
    await page.keyboard.press('Tab')
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)
    expect(outline).toBe('solid')
  })
})

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true })

  test('no row of the top line starts with a separator dot', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    await expect(page.locator('.top .weather')).toBeVisible()
    const rows = await page.evaluate(() => {
      const items = [...document.querySelectorAll<HTMLElement>('.top > :not(.break)')]
      const firstOfRow = new Map<number, HTMLElement>()
      for (const el of items) {
        const row = Math.round(el.getBoundingClientRect().bottom / 20)
        if (!firstOfRow.has(row)) firstOfRow.set(row, el)
      }
      return [...firstOfRow.values()].map((el) => {
        const dot = getComputedStyle(el, '::before')
        return dot.content === 'none' || dot.display === 'none'
      })
    })
    expect(rows.length).toBeGreaterThan(1)
    expect(rows).not.toContain(false)
  })

  test('nothing overflows sideways and the footer controls are large enough to tap', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
    const size = await page.locator('.toggle').evaluate((el) => {
      const inset = parseFloat(getComputedStyle(el, '::after').top)
      return (el as HTMLElement).offsetWidth - 2 * inset
    })
    expect(size).toBeGreaterThanOrEqual(44)
  })
})
