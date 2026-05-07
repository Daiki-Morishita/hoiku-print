import { Suspense } from 'react'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { filterMaterials } from '@/lib/data'
import type { Category, Season } from '@/lib/types'

interface SearchParams {
  age?: string
  category?: string
  season?: string
  event?: string
  search?: string
}

export const metadata = {
  title: '教材を探す',
  description: '保育園・幼稚園向け無料教材プリント一覧。年齢・種類・季節・行事で絞り込めます。',
}

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const filtered = filterMaterials({
    age: params.age ? Number(params.age) : undefined,
    category: params.category as Category | undefined,
    season: params.season as Season | undefined,
    event: params.event,
    search: params.search,
  })

  const activeCount = [params.age, params.category, params.season, params.event].filter(Boolean).length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">教材を探す</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length}件の教材が見つかりました
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* フィルターサイドバー */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-white border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">絞り込み</h2>
              {activeCount > 0 && (
                <a href="/materials" className="text-xs text-primary hover:underline">
                  クリア
                </a>
              )}
            </div>
            <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-lg" />}>
              <SearchFilters />
            </Suspense>
          </div>
        </aside>

        {/* 教材グリッド */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium">該当する教材が見つかりませんでした</p>
              <p className="text-sm mt-1">条件を変えて探してみてください</p>
              <a href="/materials" className="inline-block mt-4 text-sm text-primary hover:underline">
                すべての教材を見る
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
