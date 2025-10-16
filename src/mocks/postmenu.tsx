import type { TFunction } from 'i18next'

const createMoreMenuItems = (t: TFunction<'translation', undefined>) => [
  { text: t('feed.menu_more.report'), color: 'text-red-500' },
  { text: t('feed.menu_more.unfollow'), color: 'text-red-500' },
  { text: t('feed.menu_more.add'), color: 'text-white' },
  { text: t('feed.menu_more.goto'), color: 'text-white' },
  { text: t('feed.menu_more.share'), color: 'text-white' },
  { text: t('feed.menu_more.copy'), color: 'text-white' },
  { text: t('feed.menu_more.embled'), color: 'text-white' },
  { text: t('feed.menu_more.about'), color: 'text-white' },
  { text: t('feed.menu_more.cancel'), color: 'text-white' },
]

export { createMoreMenuItems }
