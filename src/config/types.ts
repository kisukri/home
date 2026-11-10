import type { Component } from 'vue'
import type { PeriodName } from '@/utils/period'

export interface SocialLink {
  name: string
  tip: string
  url: string
  icon: Component
}

export interface SiteLink {
  name: string
  url: string
  icon: Component
}

export interface LinkGroup {
  name: string
  links: SiteLink[]
}

export interface SiteConfig {
  name: string
  title: string
  author: string
  url: string
  since: string
  icp: string
  intro: {
    lang?: string
    lines: string[]
  }
  background: 'sky' | 'bing'
  bingApi: string
  backgrounds: Partial<Record<PeriodName, string>>
  weather: {
    enabled: boolean
    location?: { city: string; latitude: number; longitude: number }
  }
  social: SocialLink[]
  linkGroups: LinkGroup[]
}
