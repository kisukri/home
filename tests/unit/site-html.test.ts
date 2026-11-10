import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { SiteConfig } from '../../src/config/types.ts'
import { BASE_BACKGROUND, THEME_INK } from '../../src/utils/period.ts'
import { fallbackHtml, metaTags, webManifest } from '../../tools/vite/site-html.ts'

const icon = {}
const site: SiteConfig = {
  name: 'A & <B>',
  title: 'T <1>',
  author: 'Author',
  url: 'https://example.com',
  since: '2020-01-06',
  icp: 'ICP "1"',
  intro: { lines: ['hello </script><script>alert(1)</script>'] },
  background: 'sky',
  bingApi: '',
  backgrounds: {},
  weather: { enabled: false },
  social: [
    { name: 'Git', tip: '', url: 'https://example.com/git', icon },
    { name: 'Mail', tip: '', url: 'mailto:me@example.com', icon },
  ],
  linkGroups: [{ name: 'Daily', links: [{ name: 'Blog', url: 'https://example.com/?a=1&b="2"', icon }] }],
}

const none = () => false
const all = () => true

describe('fallbackHtml', () => {
  const html = fallbackHtml(site)

  it('escapes everything that comes from the config', () => {
    expect(html).toContain('<h1>A &amp; &lt;B&gt;</h1>')
    expect(html).toContain('href="https://example.com/?a=1&amp;b=&quot;2&quot;"')
    expect(html).toContain('ICP &quot;1&quot;')
    expect(html).not.toContain('<script>')
  })

  it('lists every link and marks only web links as external', () => {
    expect(html).toContain('<a href="https://example.com/git" rel="noopener noreferrer">Git</a>')
    expect(html).toContain('<a href="mailto:me@example.com">Mail</a>')
    expect(html).toContain('<h2>Daily</h2>')
  })
})

describe('metaTags', () => {
  const find = (tags: ReturnType<typeof metaTags>, key: string) =>
    tags.find((t) => t.attrs && (t.attrs.name === key || t.attrs.property === key || t.attrs.rel === key))

  it('describes the page', () => {
    const tags = metaTags(site, none)
    expect(find(tags, 'description')?.attrs?.content).toBe(site.intro.lines[0])
    expect(find(tags, 'canonical')?.attrs?.href).toBe('https://example.com/')
    expect(find(tags, 'og:url')?.attrs?.content).toBe('https://example.com/')
    expect(find(tags, 'og:title')?.attrs?.content).toBe(site.title)
  })

  it('only advertises a share image that exists', () => {
    expect(find(metaTags(site, none), 'og:image')).toBeUndefined()
    expect(find(metaTags(site, none), 'twitter:card')?.attrs?.content).toBe('summary')
    expect(find(metaTags(site, all), 'og:image')?.attrs?.content).toBe('https://example.com/og.jpg')
    expect(find(metaTags(site, all), 'twitter:card')?.attrs?.content).toBe('summary_large_image')
  })

  it('keeps the JSON-LD block from closing its own script tag', () => {
    const jsonLd = metaTags(site, none).find((t) => t.tag === 'script')
    expect(jsonLd?.children).not.toContain('</script>')
    const data = JSON.parse(String(jsonLd?.children))
    expect(data.description).toBe(site.intro.lines[0])
    expect(data.sameAs).toEqual(['https://example.com/git'])
  })
})

describe('webManifest', () => {
  it('lists the icons that exist', () => {
    expect(webManifest(site, none).icons).toEqual([])
    const icons = webManifest(site, all).icons
    expect(icons.map((i) => i.sizes)).toEqual(['192x192', '192x192', '512x512', '512x512'])
    expect(icons.map((i) => i.purpose)).toEqual(['any', 'maskable', 'any', 'maskable'])
  })
})

describe('colours shared with the stylesheet', () => {
  const css = readFileSync(new URL('../../src/styles/main.css', import.meta.url), 'utf8')
  const inkOf = (theme: string) => new RegExp(`data-theme='${theme}'\\] \\{[^}]*?--ink: (#[0-9a-f]{6});`).exec(css)?.[1]

  it('matches --ink in main.css', () => {
    expect(inkOf('dark')).toBe(THEME_INK.dark)
    expect(inkOf('light')).toBe(THEME_INK.light)
  })

  it('matches --base in main.css', () => {
    expect(/--base: (#[0-9a-f]{6});/.exec(css)?.[1]).toBe(BASE_BACKGROUND)
  })
})
