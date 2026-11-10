import { expect, ready, test } from './fixtures'

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('shows the static version instead of the loading screen', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#boot')).toBeHidden()
    await expect(page.locator('#fallback h1')).toBeVisible()
    await expect(page.locator('#fallback a', { hasText: 'Blog' })).toBeVisible()
  })
})

test('falls back to the static version when the app bundle fails to load', async ({ page }) => {
  await page.route('**/assets/index-*.js', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('#boot')).toHaveCount(0)
  await expect(page.locator('#fallback h1')).toBeVisible()
})

test('replaces the static version once the app mounts', async ({ page, errors }) => {
  await page.goto('/')
  await ready(page)
  await expect(page.locator('#fallback')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Alue')
  expect(errors).toEqual([])
})

test('the loading screen and the app agree on the period', async ({ page }) => {
  await page.goto('/?period=day')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await ready(page)
  await expect(page.locator('.top .period')).toHaveText('昼')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#7fb6f2')
})
