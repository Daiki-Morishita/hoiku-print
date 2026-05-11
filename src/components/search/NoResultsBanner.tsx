'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  query: string
}

export function NoResultsBanner({ query }: Props) {
  useEffect(() => {
    fetch('/api/search-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).catch(() => {})
  }, [query])

  return (
    <div className="text-center py-16 text-muted-foreground">
      <div className="text-4xl mb-3">🔍</div>
      <p className="font-medium text-gray-800">「{query}」の素材はありませんでした</p>
      <p className="text-sm mt-2 text-muted-foreground">新規素材として採用されましたら、後日掲載いたします。</p>
      <Link href="/materials" className="inline-block mt-4 text-sm text-primary hover:underline">
        すべての教材を見る
      </Link>
    </div>
  )
}
