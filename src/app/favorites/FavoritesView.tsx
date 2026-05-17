'use client'

import Link from 'next/link'
import { Printer, Trash2, Heart, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { useFavorites } from '@/components/favorites/FavoritesProvider'
import type { Material } from '@/lib/types'

interface Props {
  materials: Material[]
  limit: number
}

export function FavoritesView({ materials: initialMaterials, limit }: Props) {
  const { isFavorite, toggle } = useFavorites()
  const [removing, setRemoving] = useState<string | null>(null)

  // Filter current favorites (in case user removed some)
  const materials = initialMaterials.filter(m => isFavorite(m.id) || removing === m.id)
  const count = materials.filter(m => isFavorite(m.id)).length

  async function handlePrintAll() {
    if (materials.length === 0) return
    // Open browser print of dedicated print-all route
    const ids = materials.filter(m => isFavorite(m.id)).map(m => m.id).join(',')
    window.open(`/favorites/print?ids=${ids}`, '_blank')
  }

  async function handleRemove(id: string) {
    setRemoving(id)
    await toggle(id)
    setTimeout(() => setRemoving(null), 300)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 pb-4 border-b border-border flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-rounded font-bold text-[12px] text-primary mb-1 tracking-[0.1em] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-primary" />
            お気に入り
          </div>
          <h1 className="font-rounded text-[26px] sm:text-[32px] font-black">お気に入りのぬりえ</h1>
          <p className="text-[12px] text-muted-foreground mt-2">
            <strong className="text-foreground">{count}</strong> / {limit} 件
            {count >= limit && (
              <Link href="/upgrade" className="ml-2 text-primary underline">プランをアップグレード</Link>
            )}
          </p>
        </div>
        {count > 0 && (
          <button
            onClick={handlePrintAll}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[13px] font-rounded font-black hover:opacity-90 transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" />
            まとめて印刷（{count}枚）
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="bg-white border border-border rounded-lg p-10 text-center">
          <div className="text-5xl mb-4">💝</div>
          <h2 className="font-rounded text-[18px] font-black mb-2">まだお気に入りがありません</h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
            気に入った教材のハートをタップすると、ここに集まります。<br />
            まとめて印刷もできます。
          </p>
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-[13px] font-rounded font-black hover:opacity-90 transition-colors"
          >
            ぬりえを探す<ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {materials.map(m => (
              <div key={m.id} className="relative group">
                <MaterialCard material={m} />
                <button
                  onClick={() => handleRemove(m.id)}
                  aria-label="お気に入りから削除"
                  className="absolute top-2 left-2 z-20 w-7 h-7 rounded-full bg-white/95 backdrop-blur shadow-md border border-border flex items-center justify-center text-foreground/60 hover:text-red-600 hover:scale-110 active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {count >= limit && (
            <div className="bg-[#FFF3E0]/60 border border-primary/30 rounded-lg p-5 text-center">
              <div className="text-3xl mb-2">🎈</div>
              <p className="font-rounded font-black text-[15px] mb-1">無料プランの上限に達しました</p>
              <p className="text-[12px] text-muted-foreground mb-3">
                さらに保存するには、有料プランへアップグレードしてください。
              </p>
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-[12px] font-rounded font-black"
              >
                プランを見る<ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
