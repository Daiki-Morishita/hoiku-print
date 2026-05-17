/**
 * 管理画面で変更された imageStatus / illustNotes は data.ts (静的) に書き戻せないので、
 * DB の MaterialOverride テーブルから読み出し、Material にマージ適用する。
 * server コンポーネントから呼ぶこと。
 */
import { prisma } from './db'
import type { Material, ImageStatus } from './types'

export type MaterialOverride = {
  materialId: string
  imageStatus: ImageStatus | null
  illustNotes: string | null
}

let _cache: Map<string, MaterialOverride> | null = null
let _cacheAt = 0
const TTL_MS = 30_000 // 30 sec cache within a serverless instance

export async function loadOverrides(): Promise<Map<string, MaterialOverride>> {
  if (_cache && Date.now() - _cacheAt < TTL_MS) return _cache
  try {
    const rows = await prisma.materialOverride.findMany()
    _cache = new Map(rows.map(r => [r.materialId, {
      materialId: r.materialId,
      imageStatus: (r.imageStatus ?? null) as ImageStatus | null,
      illustNotes: r.illustNotes,
    }]))
    _cacheAt = Date.now()
  } catch {
    _cache = new Map()
  }
  return _cache
}

/** Apply DB overrides to materials and filter out needs_revision items */
export function applyOverridesToMaterial(m: Material, overrides: Map<string, MaterialOverride>): Material {
  const o = overrides.get(m.id)
  if (!o) return m
  return {
    ...m,
    ...(o.imageStatus ? { imageStatus: o.imageStatus } : {}),
    ...(o.illustNotes != null ? { illustNotes: o.illustNotes } : {}),
  }
}

export function effectiveStatus(m: Material, overrides: Map<string, MaterialOverride>): ImageStatus | undefined {
  return overrides.get(m.id)?.imageStatus ?? m.imageStatus
}

/** Returns true if material should be hidden from public (needs_revision) */
export function isHidden(m: Material, overrides: Map<string, MaterialOverride>): boolean {
  return effectiveStatus(m, overrides) === 'needs_revision'
}

export function invalidateOverridesCache() {
  _cache = null
  _cacheAt = 0
}
