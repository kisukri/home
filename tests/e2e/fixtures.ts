import { test as base, expect, type Page } from '@playwright/test'

const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8Dwn4EIAAAfHQP/2Yx4JwAAAABJRU5ErkJggg==',
  'base64',
)

async function mockNetwork(page: Page) {
  await page.route('https://v1.hitokoto.cn/**', (route) =>
    route.fulfill({ json: { hitokoto: '测试用的一句话。', from: '来源', from_who: null } }),
  )
  await page.route('https://get.geojs.io/**', (route) =>
    route.fulfill({ json: { city: 'Tokyo', latitude: '35.6', longitude: '139.7' } }),
  )
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        current: { temperature_2m: 12, relative_humidity_2m: 60, weather_code: 1, wind_speed_10m: 5, is_day: 1 },
        daily: { temperature_2m_max: [15], temperature_2m_min: [8] },
      },
    }),
  )
  await page.route('https://uk.cd/bing', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    await route.fulfill({ contentType: 'image/png', body: PIXEL })
  })
}

export const test = base.extend<{ errors: string[] }>({
  page: async ({ page }, use) => {
    await mockNetwork(page)
    await use(page)
  },
  errors: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await use(errors)
  },
})

export async function ready(page: Page) {
  await expect(page.locator('#boot')).toHaveCount(0)
  await expect(page.locator('.page')).not.toHaveClass(/booting/)
}

export { expect }
