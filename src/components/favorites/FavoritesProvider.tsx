'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface FavoritesState {
  ids: Set<string>
  count: number
  limit: number
  loading: boolean
  isFavorite: (id: string) => boolean
  toggle: (id: string) => Promise<ToggleResult>
}

type ToggleResult =
  | { ok: true; added: boolean }
  | { ok: false; reason: 'unauthorized' | 'limit_reached' | 'error' }

const FavoritesContext = createContext<FavoritesState | null>(null)

const FREE_LIMIT = 10

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  // Fetch favorites on login
  useEffect(() => {
    if (status !== 'authenticated') {
      setIds(new Set())
      return
    }
    setLoading(true)
    fetch('/api/favorites')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: { ids: string[] }) => setIds(new Set(data.ids)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  const isFavorite = useCallback((id: string) => ids.has(id), [ids])

  const toggle = useCallback(async (id: string): Promise<ToggleResult> => {
    if (status !== 'authenticated') {
      return { ok: false, reason: 'unauthorized' }
    }
    const wasFavorited = ids.has(id)

    // Optimistic update
    setIds(prev => {
      const next = new Set(prev)
      if (wasFavorited) next.delete(id)
      else next.add(id)
      return next
    })

    try {
      const res = await fetch(`/api/favorites/${id}`, {
        method: wasFavorited ? 'DELETE' : 'POST',
      })
      if (!res.ok) {
        // Rollback
        setIds(prev => {
          const next = new Set(prev)
          if (wasFavorited) next.add(id)
          else next.delete(id)
          return next
        })
        if (res.status === 402) return { ok: false, reason: 'limit_reached' }
        if (res.status === 401) return { ok: false, reason: 'unauthorized' }
        return { ok: false, reason: 'error' }
      }
      return { ok: true, added: !wasFavorited }
    } catch {
      setIds(prev => {
        const next = new Set(prev)
        if (wasFavorited) next.add(id)
        else next.delete(id)
        return next
      })
      return { ok: false, reason: 'error' }
    }
  }, [ids, status])

  return (
    <FavoritesContext.Provider value={{ ids, count: ids.size, limit: FREE_LIMIT, loading, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider')
  return ctx
}
