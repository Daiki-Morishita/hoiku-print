import type { MetadataRoute } from 'next'
import { materials } from '@/lib/data'

const BASE_URL = 'https://nurie-print.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const materialPages = materials.map(m => ({
    url: `${BASE_URL}/materials/${m.id}`,
    lastModified: m.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/materials`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...materialPages,
  ]
}
