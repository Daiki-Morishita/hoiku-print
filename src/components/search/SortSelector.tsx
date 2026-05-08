'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Lock } from 'lucide-react'
import type { SortKey } from '@/lib/data'

const options: { key: SortKey; label: string; requiresLogin: boolean }[] = [
  { key: 'newest',    label: '新着順',       requiresLogin: false },
  { key: 'popular',   label: '人気順',       requiresLogin: false },
  { key: 'favorites', label: 'お気に入り順', requiresLogin: true  },
]

export function SortSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = (searchParams.get('sort') as SortKey) ?? 'newest'

  function select(key: SortKey, requiresLogin: boolean) {
    if (requiresLogin) {
      // ログイン実装後にここで router.push('/login') に置き換える
      alert('お気に入り順はログイン後にご利用いただけます。')
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', key)
    router.push(`/materials?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
      {options.map(({ key, label, requiresLogin }) => {
        const active = current === key && !requiresLogin
        return (
          <button
            key={key}
            onClick={() => select(key, requiresLogin)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap
              ${active
                ? 'bg-white shadow-sm text-foreground'
                : requiresLogin
                  ? 'text-muted-foreground cursor-pointer hover:text-foreground/70'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {label}
            {requiresLogin && <Lock className="w-3 h-3 ml-0.5 opacity-60" />}
          </button>
        )
      })}
    </div>
  )
}
