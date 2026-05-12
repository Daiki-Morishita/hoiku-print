'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Material, ImageStatus } from '@/lib/types'
import { IMAGE_STATUS_LABELS, IMAGE_STATUS_COLOR } from '@/lib/types'
import { DeleteButton } from './DeleteButton'
import { EditMaterialModal } from './EditMaterialModal'

type SortKey = 'id' | 'status' | 'version' | 'created'
type SortDir = 'asc' | 'desc'
type ViewMode = 'list' | 'tile'
type TileSize = 'sm' | 'md' | 'lg' | 'xl'

const STATUS_ORDER: Record<ImageStatus | 'placeholder', number> = {
  needs_revision: 0,
  pending_review: 1,
  approved: 2,
  placeholder: 3,
}

const DIFFICULTY_RANK: Record<string, number> = {
  simple: 0,
  easy: 1,
  normal: 2,
  rich: 3,
}

/** id を {theme, difficulty順, variant} に分解してソート用キーを返す */
function parseId(id: string): { theme: string; diff: number; variant: number } {
  // パターン: {theme}-{simple|easy|normal|rich}-{N}
  const m = id.match(/^(.+)-(simple|easy|normal|rich)(?:-(\d+))?$/)
  if (m) {
    return {
      theme: m[1],
      diff: DIFFICULTY_RANK[m[2]] ?? 99,
      variant: m[3] ? parseInt(m[3], 10) : 1,
    }
  }
  return { theme: id, diff: 99, variant: 0 }
}

const STATUS_OPTIONS: ImageStatus[] = ['placeholder', 'pending_review', 'approved', 'needs_revision']

const TILE_SIZES: Record<TileSize, { cols: string; w: number; h: number }> = {
  sm: { cols: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8', w: 120, h: 90 },
  md: { cols: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6', w: 180, h: 135 },
  lg: { cols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4', w: 280, h: 210 },
  xl: { cols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3', w: 400, h: 300 },
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-0.5 text-gray-300 text-[10px]">↕</span>
  return <span className="ml-0.5 text-[10px]">{dir === 'asc' ? '↑' : '↓'}</span>
}

async function updateStatus(id: string, status: ImageStatus) {
  const res = await fetch('/api/admin/update-material', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, imageStatus: status }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'ステータス更新失敗')
  }
}

export function AdminMaterialsTable({ materials }: { materials: Material[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [editTarget, setEditTarget] = useState<Material | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [tileSize, setTileSize] = useState<TileSize>('md')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<ImageStatus>('approved')
  const [busy, setBusy] = useState(false)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(ids: string[]) {
    setSelectedIds(prev => {
      const allSelected = ids.every(i => prev.has(i))
      if (allSelected) return new Set()
      return new Set(ids)
    })
  }

  async function handleRowStatusChange(id: string, status: ImageStatus) {
    setBusy(true)
    try {
      await updateStatus(id, status)
      window.location.reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'エラー')
      setBusy(false)
    }
  }

  async function handleBulkStatusChange() {
    if (selectedIds.size === 0) return
    if (!confirm(`${selectedIds.size}件のステータスを「${IMAGE_STATUS_LABELS[bulkStatus]}」に変更しますか？`)) return
    setBusy(true)
    try {
      for (const id of selectedIds) {
        await updateStatus(id, bulkStatus)
      }
      window.location.reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'エラー')
      setBusy(false)
    }
  }

  const sorted = [...materials].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'id') {
      const pa = parseId(a.id)
      const pb = parseId(b.id)
      cmp = pa.theme.localeCompare(pb.theme)
        || (pa.variant - pb.variant)
        || (pa.diff - pb.diff)
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

  const allIds = sorted.map(m => m.id)
  const allSelected = selectedIds.size > 0 && allIds.every(i => selectedIds.has(i))

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

      {/* ツールバー */}
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3 text-xs">
        {/* 表示切替 */}
        <div className="flex items-center gap-1">
          <span className="text-gray-500">表示:</span>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >リスト</button>
          <button
            onClick={() => setViewMode('tile')}
            className={`px-2 py-1 rounded ${viewMode === 'tile' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >タイル</button>
        </div>

        {/* タイルサイズ */}
        {viewMode === 'tile' && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">サイズ:</span>
            {(['sm','md','lg','xl'] as TileSize[]).map(s => (
              <button
                key={s}
                onClick={() => setTileSize(s)}
                className={`px-2 py-1 rounded ${tileSize === s ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >{s.toUpperCase()}</button>
            ))}
          </div>
        )}

        {/* 一括操作 */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-gray-500">選択中: {selectedIds.size}件</span>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value as ImageStatus)}
            className="border border-gray-200 rounded px-2 py-1"
            disabled={busy}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{IMAGE_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button
            onClick={handleBulkStatusChange}
            disabled={busy || selectedIds.size === 0}
            className="px-2.5 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400"
          >一括変更</button>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
            >クリア</button>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className={thBase}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => toggleSelectAll(allIds)}
                  />
                </th>
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
                const checked = selectedIds.has(m.id)

                return (
                  <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${checked ? 'bg-blue-50/40' : ''}`}>
                    <td className="px-4 py-1.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(m.id)}
                      />
                    </td>
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
                      <select
                        value={status}
                        onChange={e => handleRowStatusChange(m.id, e.target.value as ImageStatus)}
                        disabled={busy}
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeClass} cursor-pointer`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{IMAGE_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
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
      ) : (
        // タイル表示
        <div className="p-4">
          <div className={`grid ${TILE_SIZES[tileSize].cols} gap-3`}>
            {sorted.map(m => {
              const status = m.imageStatus ?? 'placeholder'
              const badgeClass = IMAGE_STATUS_COLOR[status]
              const hasIllust = !!m.illustUrl
              const checked = selectedIds.has(m.id)
              const { w, h } = TILE_SIZES[tileSize]

              return (
                <div key={m.id} className={`border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow ${checked ? 'ring-2 ring-blue-400 border-blue-300' : 'border-gray-200'}`}>
                  <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: h }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(m.id)}
                      className="absolute top-2 left-2 z-10 w-4 h-4"
                    />
                    {hasIllust ? (
                      <Image
                        src={m.illustUrl!}
                        alt={m.title}
                        width={w}
                        height={h}
                        className="w-full h-full object-contain"
                      />
                    ) : m.imageUrl.endsWith('.svg') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.imageUrl} alt={m.title} className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-4xl">🖼️</span>
                    )}
                  </div>
                  <div className="p-2 space-y-1.5">
                    <a
                      href={`/materials/${m.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block font-mono text-[10px] text-blue-600 hover:underline truncate"
                      title={m.id}
                    >
                      {m.id}
                    </a>
                    <p className="text-xs text-gray-700 truncate" title={m.title}>{m.title}</p>
                    <select
                      value={status}
                      onChange={e => handleRowStatusChange(m.id, e.target.value as ImageStatus)}
                      disabled={busy}
                      className={`w-full text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${badgeClass} cursor-pointer`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{IMAGE_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditTarget(m)}
                        className="flex-1 text-[10px] text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-1.5 py-0.5 rounded"
                      >
                        編集
                      </button>
                      {m.illustUrl && <DeleteButton illustUrl={m.illustUrl} />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
