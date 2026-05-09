'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export function DeleteButton({ illustUrl }: { illustUrl: string }) {
  const [state, setState] = useState<'idle' | 'deleting' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setState('deleting')
    try {
      const res = await fetch('/api/admin/delete-material', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ illustUrl }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'エラー')
      }
      setState('done')
      setTimeout(() => window.location.reload(), 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラー')
      setState('error')
    }
  }

  if (state === 'done') return <span className="text-xs text-green-600">✅ 削除済み</span>
  if (state === 'error') return <span className="text-xs text-red-500">⚠️ {error}</span>
  if (state === 'deleting') return <span className="text-xs text-gray-400">削除中…</span>

  return (
    <button
      onClick={handleDelete}
      className="text-gray-300 hover:text-red-400 transition-colors"
      title="削除"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
