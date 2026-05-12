import { Suspense } from 'react'
import Link from 'next/link'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchBar } from '@/components/search/SearchBar'
import { SortSelector } from '@/components/search/SortSelector'
import { filterMaterials, type SortKey } from '@/lib/data'
import type { Category, Season } from '@/lib/types'
import { NoResultsBanner } from '@/components/search/NoResultsBanner'

interface SearchParams {
  age?: string
  category?: string
  season?: string
  event?: string
  search?: string
  difficulty?: string
  sort?: string
}

export const metadata = {
  title: '教材を探す',
  description: '保育園・幼稚園向け無料教材プリント一覧。年齢・種類・季節・行事で絞り込めます。',
  alternates: { canonical: 'https://nurie-print.com/materials' },
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://nurie-print.com' },
    { '@type': 'ListItem', position: 2, name: '教材一覧', item: 'https://nurie-print.com/materials' },
  ],
}

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const sort = (params.sort as SortKey) ?? 'newest'
  const filtered = filterMaterials({
    age: params.age ? Number(params.age) : undefined,
    category: params.category as Category | undefined,
    season: params.season as Season | undefined,
    event: params.event,
    search: params.search,
    difficulty: params.difficulty ? Number(params.difficulty) : undefined,
    sort,
  })

  const activeCount = [params.age, params.category, params.season, params.event, params.search, params.difficulty].filter(Boolean).length

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">教材を探す</h1>
        {activeCount === 0 && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            ぬりえ・点つなぎ・運筆など{filtered.length}点以上の教材を無料配布中。年齢・テーマ・季節で絞り込めます。
          </p>
        )}
      </div>

      {/* キーワード検索バー */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-10 bg-muted rounded-xl animate-pulse" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* フィルターサイドバー */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-white border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">絞り込み</h2>
              {activeCount > 0 && (
                <Link href="/materials" className="text-xs text-primary hover:underline">
                  クリア
                </Link>
              )}
            </div>
            <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-lg" />}>
              <SearchFilters />
            </Suspense>
          </div>
        </aside>

        {/* 教材グリッド */}
        <div className="flex-1">
          {/* ソートセレクター */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {activeCount > 0 ? `${filtered.length}件` : `全${filtered.length}件`}
            </p>
            <Suspense fallback={<div className="h-9 w-56 bg-muted rounded-xl animate-pulse" />}>
              <SortSelector />
            </Suspense>
          </div>

          {filtered.length === 0 ? (
            params.search ? (
              <NoResultsBanner query={params.search} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-medium">該当する教材が見つかりませんでした</p>
                <p className="text-sm mt-1">条件を変えて探してみてください</p>
                <Link href="/materials" className="inline-block mt-4 text-sm text-primary hover:underline">
                  すべての教材を見る
                </Link>
              </div>
            )
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
    </>
  )
}
