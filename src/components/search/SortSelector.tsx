'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { SortKey } from '@/lib/data'

export function SortSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const current = (searchParams.get('sort') as SortKey) ?? 'newest'

  // Only show favorites sort to logged-in users (avoid surprise login redirects)
  const options: { key: SortKey; label: string }[] = [
    { key: 'newest',  label: '新着順' },
    { key: 'popular', label: '人気順' },
    ...(session ? [{ key: 'favorites' as SortKey, label: 'お気に入り順' }] : []),
  ]

  function select(key: SortKey) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', key)
    router.push(`/materials?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
      {options.map(({ key, label }) => {
        const active = current === key
        return (
          <button
            key={key}
            onClick={() => select(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap
              ${active ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
