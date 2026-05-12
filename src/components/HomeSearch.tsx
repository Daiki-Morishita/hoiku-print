'use client'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HomeSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/materials?search=${encodeURIComponent(q)}` : '/materials')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-8">
      <div className="flex items-center bg-white border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all">
        <Search className="w-5 h-5 text-primary shrink-0 ml-4" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="教材を検索（動物・恐竜・夏など）"
          className="flex-1 px-3 py-3.5 text-sm sm:text-base bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-3.5 text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          検索
        </button>
      </div>
    </form>
  )
}
