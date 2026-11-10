import { expect, ready, test } from './fixtures'

const left = (style: string | null) => Number(/left:\s*([\d.]+)%/.exec(style ?? '')?.[1])

test('the sun rises on the left as dawn begins', async ({ page }) => {
  await page.goto('/?hour=5.25')
  await ready(page)
  await expect(page.locator('.top .period')).toHaveText('暁')
  expect(left(await page.locator('.scene .body').getAttribute('style'))).toBeLessThan(20)
})

test('stars only exist when the palette shows them', async ({ page }) => {
  await page.goto('/#night')
  await ready(page)
  await expect(page.locator('.stars span')).toHaveCount(6)
  await page.goto('/#day')
  await page.reload()
  await ready(page)
  await expect(page.locator('.stars')).toHaveCount(0)
})

test('the sky stays underneath until the wallpaper has faded in', async ({ page }) => {
  await page.goto('/#dusk')
  await ready(page)
  const toggle = page.getByRole('button', { name: /背景/ })

  await toggle.click()
  const photo = page.locator('.scene .photo')
  await expect(photo).toBeVisible()
  await expect.poll(() => photo.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(1)
  await expect(page.locator('.scene .sky')).toHaveCount(1)

  await expect(page.locator('.scene .sky')).toHaveCount(0)
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'photo')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await toggle.click()
  await expect(page.locator('.scene .sky')).toHaveCount(1)
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'sky')
})

test('says so when the wallpaper cannot be loaded', async ({ page }) => {
  await page.route('https://uk.cd/bing', (route) => route.abort())
  await page.goto('/')
  await ready(page)
  await page.getByRole('button', { name: /背景/ }).click()
  await expect(page.getByRole('button', { name: /加载失败/ })).toBeVisible()
  await expect(page.locator('.scene .sky')).toHaveCount(1)
})
