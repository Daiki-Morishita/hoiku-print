import type { MetadataRoute } from 'next'
import { materials } from '@/lib/data'
import { columns } from '@/lib/columns'

const BASE_URL = 'https://nurie-print.com'

const AGES = [2, 3, 4, 5, 6]
const CATEGORIES = ['coloring', 'hiragana', 'numbers', 'drawing', 'maze', 'dotconnect', 'craft', 'scissors']
const SEASONS = ['spring', 'summer', 'autumn', 'winter']
const EVENTS = ['hinamatsuri', 'childrensday', 'tanabata', 'summerfestival', 'sports', 'halloween', 'christmas', 'setsubun', 'graduation']

export default function sitemap(): MetadataRoute.Sitemap {
  const materialPages = materials.map(m => ({
    url: `${BASE_URL}/materials/${m.id}`,
    lastModified: m.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    ...(m.imageUrl ? { images: [m.imageUrl] } : {}),
  }))

  const categoryPages = [
    ...AGES.map(age => ({ url: `${BASE_URL}/category/age/${age}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...CATEGORIES.map(c => ({ url: `${BASE_URL}/category/type/${c}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...SEASONS.map(s => ({ url: `${BASE_URL}/category/season/${s}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...EVENTS.map(e => ({ url: `${BASE_URL}/category/event/${e}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/materials`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/columns`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...columns.map(c => ({
      url: `${BASE_URL}/columns/${c.slug}`,
      lastModified: new Date(c.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/editorial-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...categoryPages,
    ...materialPages,
  ]
}
