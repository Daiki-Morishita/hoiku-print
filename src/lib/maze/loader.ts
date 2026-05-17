import data from './data.json'
import {
  MAZE_DIFFICULTY_ORDER,
  MAZE_SHAPE_ORDER,
  type MazeDataset,
  type MazeDifficulty,
  type MazeRecord,
  type MazeShape,
} from './types'

const dataset = data as Partial<MazeDataset>

function bucketsForShape(shape: MazeShape): Partial<Record<MazeDifficulty, MazeRecord[]>> {
  return (dataset[shape] ?? {}) as Partial<Record<MazeDifficulty, MazeRecord[]>>
}

export function getAllMazes(): MazeRecord[] {
  const all: MazeRecord[] = []
  for (const sh of MAZE_SHAPE_ORDER) {
    for (const diff of MAZE_DIFFICULTY_ORDER) {
      const arr = bucketsForShape(sh)[diff]
      if (arr) all.push(...arr)
    }
  }
  return all
}

export function getMazesByShape(shape: MazeShape): MazeRecord[] {
  const buckets = bucketsForShape(shape)
  const out: MazeRecord[] = []
  for (const diff of MAZE_DIFFICULTY_ORDER) {
    const arr = buckets[diff]
    if (arr) out.push(...arr)
  }
  return out
}

export function getMazesByShapeAndDifficulty(shape: MazeShape, diff: MazeDifficulty): MazeRecord[] {
  return bucketsForShape(shape)[diff] ?? []
}

export function getMazeBySlug(slug: string): MazeRecord | null {
  // slug 形式: "{shape}-{difficulty}-{nnn}"。shape は 'triangle-up' のようにハイフン含むので注意。
  for (const sh of MAZE_SHAPE_ORDER) {
    if (!slug.startsWith(`${sh}-`)) continue
    const rest = slug.slice(sh.length + 1) // "{difficulty}-{nnn}"
    const dashIdx = rest.indexOf('-')
    if (dashIdx < 0) continue
    const diffKey = rest.slice(0, dashIdx) as MazeDifficulty
    const arr = bucketsForShape(sh)[diffKey]
    if (!arr) continue
    const hit = arr.find(m => m.slug === slug)
    if (hit) return hit
  }
  return null
}

export function getAllSlugs(): string[] {
  return getAllMazes().map(m => m.slug)
}
