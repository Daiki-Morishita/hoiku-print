'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Material, ImageStatus } from '@/lib/types'
import { IMAGE_STATUS_LABELS, IMAGE_STATUS_COLOR } from '@/lib/types'
import { DeleteButton } from './DeleteButton'
import { EditMaterialModal } from './EditMaterialModal'

type SortKey = 'id' | 'status' | 'version' | 'created'
type SortDir = 'asc' | 'desc'

const STATUS_ORDER: Record<ImageStatus | 'placeholder', number> = {
  needs_revision: 0,
  pending_review: 1,
  approved: 2,
  placeholder: 3,
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-0.5 text-gray-300 text-[10px]">↕</span>
  return <span className="ml-0.5 text-[10px]">{dir === 'asc' ? '↑' : '↓'}</span>
}

export function AdminMaterialsTable({ materials }: { materials: Material[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [editTarget, setEditTarget] = useState<Material | null>(null)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...materials].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'id') {
      cmp = a.id.localeCompare(b.id)
    } else if (sortKey === 'status') {
      const sa = STATUS_ORDER[a.imageStatus ?? 'placeholder'] ?? 99
      const sb = STATUS_ORDER[b.imageStatus ?? 'placeholder'] ?? 99
      cmp = sa - sb
    } else if (sortKey === 'version') {
      cmp = (a.illustVersion ?? 0) - (b.illustVersion ?? 0)
    } else if (sortKey === 'created') {
      cmp = a.createdAt.localeCompare(b.createdAt)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const thBase = 'px-4 py-2 text-left font-medium'
  const thSort = `${thBase} cursor-pointer hover:text-gray-700 select-none`

  return (
    <>
    {editTarget && (
      <EditMaterialModal
        material={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => window.location.reload()}
      />
    )}
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
            <th className={thBase}>プレビュー</th>
            <th className={thSort} onClick={() => handleSort('id')}>
              ID / タイトル <SortIcon active={sortKey === 'id'} dir={sortDir} />
            </th>
            <th className={thSort} onClick={() => handleSort('status')}>
              ステータス <SortIcon active={sortKey === 'status'} dir={sortDir} />
            </th>
            <th className={thBase}>イラストファイル</th>
            <th className={thSort} onClick={() => handleSort('version')}>
              VER. <SortIcon active={sortKey === 'version'} dir={sortDir} />
            </th>
            <th className={thSort} onClick={() => handleSort('created')}>
              登録日 <SortIcon active={sortKey === 'created'} dir={sortDir} />
            </th>
            <th className={thBase}>メモ</th>
            <th className={thBase}></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map(m => {
            const status = m.imageStatus ?? 'placeholder'
            const badgeClass = IMAGE_STATUS_COLOR[status]
            const hasIllust = !!m.illustUrl

            return (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-1.5">
                  <div className="w-14 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center border border-gray-200">
                    {hasIllust ? (
                      <Image
                        src={m.illustUrl!}
                        alt={m.title}
                        width={56}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : m.imageUrl.endsWith('.svg') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.imageUrl} alt={m.title} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-xl">🖼️</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-1.5">
                  <a
                    href={`/materials/${m.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-blue-600 hover:underline"
                  >
                    {m.id}
                  </a>
                  <p className="text-xs text-gray-700 mt-0.5 max-w-[200px]">{m.title}</p>
                </td>

                <td className="px-4 py-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
                    {IMAGE_STATUS_LABELS[status]}
                  </span>
                </td>

                <td className="px-4 py-1.5 max-w-[180px]">
                  {hasIllust ? (
                    <code className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded block truncate" title={m.illustUrl!}>
                      {m.illustUrl!.split('/').pop()}
                    </code>
                  ) : (
                    <code className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      未設定
                    </code>
                  )}
                </td>

                <td className="px-4 py-1.5 text-xs text-gray-500">
                  {m.illustVersion ? `v${m.illustVersion}` : '—'}
                </td>

                <td className="px-4 py-1.5 text-xs text-gray-400">
                  {m.createdAt}
                </td>

                <td className="px-4 py-1.5 text-xs text-gray-500 max-w-[160px] truncate">
                  {m.illustNotes ?? <span className="text-gray-300">—</span>}
                </td>

                <td className="px-4 py-1.5 flex items-center gap-2">
                  <button
                    onClick={() => setEditTarget(m)}
                    className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2 py-0.5 rounded"
                  >
                    編集
                  </button>
                  {m.illustUrl && <DeleteButton illustUrl={m.illustUrl} />}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    </>
  )
}
