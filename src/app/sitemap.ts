import type { MetadataRoute } from 'next'
import { materials, filterMaterials } from '@/lib/data'
import { columns } from '@/lib/columns'

const BASE_URL = 'https://nurie-print.com'

const AGES = [2, 3, 4, 5, 6]
const ALL_THEMES = ['animals', 'dinosaurs', 'vehicles', 'sea', 'park']

export default function sitemap(): MetadataRoute.Sitemap {
  const materialPages = materials.map(m => ({
    url: `${BASE_URL}/materials/${m.id}`,
    lastModified: m.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    ...(m.imageUrl ? { images: [m.imageUrl] } : {}),
  }))

  // Only include theme/season pages that have actual materials
  const themePages = ALL_THEMES
    .filter(t => filterMaterials({ theme: t as Parameters<typeof filterMaterials>[0]['theme'] }).length > 0)
    .map(t => ({ url: `${BASE_URL}/category/theme/${t}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 }))

  const seasonPages = ['spring', 'summer', 'autumn', 'winter']
    .filter(s => filterMaterials({ season: s as Parameters<typeof filterMaterials>[0]['season'] }).length > 0)
    .map(s => ({ url: `${BASE_URL}/category/season/${s}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 }))

  const categoryPages = [
    ...AGES.map(age => ({ url: `${BASE_URL}/category/age/${age}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 })),
    { url: `${BASE_URL}/category/type/coloring`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    ...themePages,
    ...seasonPages,
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
