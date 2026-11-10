import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runnerImport, type HtmlTagDescriptor, type Plugin } from 'vite'
import Icons from 'unplugin-icons/vite'
import type { SiteConfig } from '../../src/config/types.ts'
import { BASE_BACKGROUND, PALETTES, PERIOD_BOUNDS, PERIOD_WRAP, THEME_INK } from '../../src/utils/period.ts'

const BOOT_TIMEOUT_MS = 10_000

const SHARE_IMAGE = { file: 'og.jpg', width: 1200, height: 630 }
const TOUCH_ICON = 'apple-touch-icon.png'
const MANIFEST_ICONS = [192, 512].map((size) => ({ file: `icon-${size}.png`, size }))
const ICON_PURPOSES = ['any', 'maskable'] as const

const inPublic = (file: string) => existsSync(fileURLToPath(new URL(`../../public/${file}`, import.meta.url)))
const homeOf = (url: string) => (url.endsWith('/') ? url : `${url}/`)

const SITE_MODULE = fileURLToPath(new URL('../../src/config/site.ts', import.meta.url))
const SRC = fileURLToPath(new URL('../../src', import.meta.url))

async function loadSite(): Promise<SiteConfig> {
  const { module } = await runnerImport<{ site: SiteConfig }>(SITE_MODULE, {
    configFile: false,
    logLevel: 'error',
    plugins: [Icons({ compiler: 'vue3' })],
    resolve: { alias: { '@': SRC } },
  })
  return module.site
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const inlineJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')

const rgbTriplet = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ')

const isWeb = (url: string) => /^https?:/.test(url)

function bootData() {
  return {
    timeout: BOOT_TIMEOUT_MS,
    bounds: PERIOD_BOUNDS,
    wrap: PERIOD_WRAP,
    periods: Object.fromEntries(
      Object.entries(PALETTES).map(([name, p]) => [
        name,
        {
          label: p.label,
          theme: p.theme,
          sky: p.sky,
          ink: rgbTriplet(THEME_INK[p.theme]),
          glow: rgbTriplet(p.bodyColor),
        },
      ]),
    ),
  }
}

function link(name: string, url: string) {
  const external = isWeb(url) ? ' rel="noopener noreferrer"' : ''
  return `<a href="${escapeHtml(url)}"${external}>${escapeHtml(name)}</a>`
}

function list(items: { name: string; url: string }[]) {
  return `<ul>${items.map((item) => `<li>${link(item.name, item.url)}</li>`).join('')}</ul>`
}

export function fallbackHtml(site: SiteConfig) {
  const description = site.intro.lines[0]
  return [
    '<main id="fallback">',
    `<h1>${escapeHtml(site.name)}</h1>`,
    description ? `<p>${escapeHtml(description)}</p>` : '',
    `<nav aria-label="社交账号">${list(site.social)}</nav>`,
    ...site.linkGroups.map((group) => `<section><h2>${escapeHtml(group.name)}</h2>${list(group.links)}</section>`),
    '<footer>',
    `© ${escapeHtml(site.since.slice(0, 4))} ${link(site.author, site.url)}`,
    site.icp ? ` · ${escapeHtml(site.icp)}` : '',
    '<noscript><p>开启 JavaScript 可以看到完整的页面。</p></noscript>',
    '</footer>',
    '</main>',
  ].join('')
}

export function metaTags(site: SiteConfig, has = inPublic): HtmlTagDescriptor[] {
  const description = site.intro.lines[0] ?? ''
  const home = homeOf(site.url)
  const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'meta', attrs, injectTo: 'head' })
  const link = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'link', attrs, injectTo: 'head' })
  const shareImage = has(SHARE_IMAGE.file)

  return [
    meta({ name: 'description', content: description }),
    meta({ name: 'author', content: site.author }),
    link({ rel: 'canonical', href: home }),
    link({ rel: 'manifest', href: '/site.webmanifest' }),
    ...(has(TOUCH_ICON) ? [link({ rel: 'apple-touch-icon', href: `/${TOUCH_ICON}` })] : []),
    meta({ property: 'og:type', content: 'profile' }),
    meta({ property: 'og:site_name', content: site.name }),
    meta({ property: 'og:title', content: site.title }),
    meta({ property: 'og:description', content: description }),
    meta({ property: 'og:url', content: home }),
    ...(shareImage
      ? [
          meta({ property: 'og:image', content: `${home}${SHARE_IMAGE.file}` }),
          meta({ property: 'og:image:width', content: String(SHARE_IMAGE.width) }),
          meta({ property: 'og:image:height', content: String(SHARE_IMAGE.height) }),
          meta({ property: 'og:image:alt', content: `${site.name} — ${description}` }),
        ]
      : []),
    meta({ name: 'twitter:card', content: shareImage ? 'summary_large_image' : 'summary' }),
    {
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      children: inlineJson({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: site.author,
        url: home,
        description,
        ...(shareImage ? { image: `${home}${SHARE_IMAGE.file}` } : {}),
        sameAs: site.social.map((s) => s.url).filter(isWeb),
      }),
      injectTo: 'head',
    },
  ]
}

export function webManifest(site: SiteConfig, has = inPublic) {
  return {
    name: site.name,
    short_name: site.name,
    description: site.intro.lines[0] ?? '',
    start_url: '/',
    display: 'standalone',
    background_color: BASE_BACKGROUND,
    theme_color: BASE_BACKGROUND,
    icons: MANIFEST_ICONS.filter((icon) => has(icon.file)).flatMap((icon) =>
      ICON_PURPOSES.map((purpose) => ({
        src: `/${icon.file}`,
        sizes: `${icon.size}x${icon.size}`,
        type: 'image/png',
        purpose,
      })),
    ),
  }
}

export function siteHtml(): Plugin {
  let site: Promise<SiteConfig> | undefined

  return {
    name: 'site-html',
    async generateBundle() {
      const config = await (site ??= loadSite())
      const home = homeOf(config.url)
      this.emitFile({
        type: 'asset',
        fileName: 'site.webmanifest',
        source: JSON.stringify(webManifest(config)),
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${home}sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHtml(home)}</loc></url></urlset>\n`,
      })
    },
    transformIndexHtml: {
      order: 'post',
      async handler(html, ctx) {
        const config = await (ctx.server ? loadSite() : (site ??= loadSite()))
        const tags = metaTags(config)
        const font = Object.keys(ctx.bundle ?? {}).find((file) => /crimson-pro.*\.woff2$/.test(file))
        if (font) {
          tags.push({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${font}`, crossorigin: '' },
            injectTo: 'head',
          })
        }

        for (const placeholder of ['__BOOT_DATA__', '__FALLBACK__', '__SITE_TITLE__']) {
          if (html.split(placeholder).length !== 2) {
            throw new Error(`index.html 里应当恰好有一个 ${placeholder} 占位符`)
          }
        }

        return {
          html: html
            .replace('__BOOT_DATA__', () => inlineJson(bootData()))
            .replace('__FALLBACK__', () => fallbackHtml(config))
            .replace('__SITE_TITLE__', () => escapeHtml(config.title))
            .replaceAll('__BASE_BACKGROUND__', BASE_BACKGROUND),
          tags,
        }
      },
    },
  }
}
