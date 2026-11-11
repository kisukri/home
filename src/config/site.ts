import type { SiteConfig } from './types'

import SiGithub from '~icons/simple-icons/github'
import SiBilibili from '~icons/simple-icons/bilibili'
import SiX from '~icons/simple-icons/x'
import SiTelegram from '~icons/simple-icons/telegram'
import PhEnvelope from '~icons/ph/envelope-simple-duotone'
import PhCoffee from '~icons/ph/coffee-duotone'

import PhArticle from '~icons/ph/article-duotone'
import PhCompass from '~icons/ph/compass-duotone'
import PhHouse from '~icons/ph/house-duotone'
import PhUserCircle from '~icons/ph/user-circle-duotone'
import PhChatDots from '~icons/ph/chat-dots-duotone'
import PhHardDrives from '~icons/ph/hard-drives-duotone'
import PhHeartbeat from '~icons/ph/heartbeat-duotone'
import PhNetwork from '~icons/ph/network-duotone'
import PhChatsCircle from '~icons/ph/chats-circle-duotone'
import PhShieldCheck from '~icons/ph/shield-check-duotone'
import PhKey from '~icons/ph/key-duotone'
import PhCode from '~icons/ph/code-duotone'
import PhGitBranch from '~icons/ph/git-branch-duotone'
import PhHeadphones from '~icons/ph/headphones-duotone'
import PhGameController from '~icons/ph/game-controller-duotone'

export const site: SiteConfig = {
  name: 'Alue',
  title: 'Alueの主页',
  author: 'Alue',
  url: 'https://ialue.com',
  since: '2020-01-06',
  icp: '萌ICP备20242111号',

  intro: {
    lang: 'en',
    lines: ['quiet youth, faded memories, and tree shadows at dusk'],
  },

  background: 'sky',
  bingApi: 'https://uk.cd/bing',

  backgrounds: {},

  weather: {
    enabled: true,
  },

  social: [
    { name: 'GitHub', tip: '去 GitHub 看看', url: 'https://github.com/kisukri', icon: SiGithub },
    { name: 'BiliBili', tip: '(゜-゜)つロ 干杯 ~', url: 'https://bilibili.wiki/', icon: SiBilibili },
    { name: 'Email', tip: '来封 Email ~', url: 'mailto:me@ialue.com', icon: PhEnvelope },
    { name: 'X', tip: '你懂的 ~', url: 'https://twitter.com/AS25085', icon: SiX },
    { name: 'Telegram', tip: 'PM ~', url: 'https://t.me/AS56367', icon: SiTelegram },
    { name: 'Donate', tip: '支持一下 ~', url: 'https://uk.cd/pay', icon: PhCoffee },
  ],

  linkGroups: [
    {
      name: 'Daily',
      links: [
        { name: 'Blog', url: 'https://blog.ialue.com/', icon: PhArticle },
        { name: 'Status', url: 'https://s.uk.uy/', icon: PhHardDrives },
        { name: 'Start', url: 'https://nav.ialue.com/', icon: PhCompass },
        { name: 'Uptime', url: 'https://uptime.ialue.com/', icon: PhHeartbeat },
        { name: 'Network', url: 'https://bgp.tn/', icon: PhNetwork },
        { name: 'PGP', url: 'https://pgp.im/', icon: PhKey },
      ],
    },
    {
      name: 'Tools',
      links: [
        { name: 'Matrix', url: 'https://m.uk.uy/', icon: PhChatsCircle },
        { name: 'Code', url: 'https://code.ialue.com/', icon: PhCode },
        { name: 'Dev', url: 'https://dev.uk.cd/', icon: PhGitBranch },
        { name: '2FA', url: 'https://2fa.pgp.im/', icon: PhShieldCheck },
      ],
    },
    {
      name: 'More',
      links: [
        { name: 'Home', url: 'https://uk.cd/', icon: PhHouse },
        { name: 'Profile', url: 'https://kisukri.com/', icon: PhUserCircle },
        { name: 'Mail', url: 'https://mail.uk.cd/', icon: PhEnvelope },
        { name: 'Guestbook', url: 'https://lost.now.cc/', icon: PhChatDots },
        { name: 'Music', url: 'https://uk.uy/', icon: PhHeadphones },
        { name: 'Mikutap', url: 'https://miku.ialue.com/', icon: PhGameController },
      ],
    },
  ],
}
