import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { filterMaterials } from '@/lib/data'
import { CATEGORY_LABELS, SEASON_LABELS, EVENT_LABELS } from '@/lib/types'
import type { Category, Season } from '@/lib/types'

type CategoryType = 'age' | 'type' | 'season' | 'event' | 'theme'

function getPageInfo(type: string, value: string): { title: string; description: string } {
  switch (type) {
    case 'age':
      return { title: `${value}歳向け教材`, description: `${value}歳のお子さんに最適な難易度の教材を集めました。` }
    case 'type':
      return {
        title: `${CATEGORY_LABELS[value as Category] ?? value}プリント`,
        description: `${CATEGORY_LABELS[value as Category] ?? value}の教材一覧です。`
      }
    case 'season':
      return {
        title: `${SEASON_LABELS[value as Season] ?? value}の教材`,
        description: `${SEASON_LABELS[value as Season] ?? value}の季節にぴったりの教材を集めました。`
      }
    case 'event':
      return {
        title: `${EVENT_LABELS[value] ?? value}の教材`,
        description: `${EVENT_LABELS[value] ?? value}で使える教材を集めました。`
      }
    default:
      return { title: '教材一覧', description: '教材を探せます。' }
  }
}

export async function generateMetadata({ params }: { params: Promise<{ type: string; value: string }> }) {
  const { type, value } = await params
  const { title, description } = getPageInfo(type, value)
  return { title, description }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ type: CategoryType; value: string }>
}) {
  const { type, value } = await params

  const filterParams: Record<string, string | number> = {}
  if (type === 'age') filterParams.age = Number(value)
  else if (type === 'type') filterParams.category = value
  else if (type === 'season') filterParams.season = value
  else if (type === 'event') filterParams.event = value
  else notFound()

  const filtered = filterMaterials(filterParams as Parameters<typeof filterMaterials>[0])
  const { title, description } = getPageInfo(type, value)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* パンくず */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">ホーム</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/materials" className="hover:text-foreground transition-colors">教材一覧</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{filtered.length}件の教材</p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium">この条件の教材は準備中です</p>
          <Link href="/materials" className="inline-block mt-4 text-sm text-primary hover:underline">
            すべての教材を見る
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(material => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  )
}
