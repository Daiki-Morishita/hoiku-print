'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { SEASON_LABELS, DIFFICULTY_LABELS } from '@/lib/types'

const ages = [2, 3, 4, 5, 6]

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === params.get(key)) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/materials?${params.toString()}`)
  }, [router, searchParams])

  const current = {
    age: searchParams.get('age'),
    season: searchParams.get('season'),
    difficulty: searchParams.get('difficulty'),
  }

  return (
    <div className="space-y-5">
      {/* 年齢 */}
      <FilterSection label="年齢">
        <div className="flex flex-wrap gap-2">
          {ages.map(age => (
            <FilterChip
              key={age}
              label={`${age}歳`}
              active={current.age === String(age)}
              onClick={() => updateParam('age', String(age))}
            />
          ))}
        </div>
      </FilterSection>

      {/* 難易度 */}
      <FilterSection label="難易度">
        <div className="flex flex-wrap gap-2">
          {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
            <FilterChip
              key={key}
              label={label}
              active={current.difficulty === key}
              onClick={() => updateParam('difficulty', key)}
            />
          ))}
        </div>
      </FilterSection>

      {/* 季節 */}
      <FilterSection label="季節">
        <div className="flex flex-wrap gap-2">
          {Object.entries(SEASON_LABELS).map(([key, label]) => (
            <FilterChip
              key={key}
              label={label}
              active={current.season === key}
              onClick={() => updateParam('season', key)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</h3>
      {children}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-full border transition-all duration-150 ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-white text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
      }`}
    >
      {label}
    </button>
  )
}
