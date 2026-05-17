import data from './data.json'
import type { MazeDataset, MazeDifficulty, MazeRecord } from './types'

const dataset = data as MazeDataset

export function getAllMazes(): MazeRecord[] {
  return (Object.values(dataset) as MazeRecord[][]).flat()
}

export function getMazesByDifficulty(diff: MazeDifficulty): MazeRecord[] {
  return dataset[diff] ?? []
}

export function getMazeBySlug(slug: string): MazeRecord | null {
  const [diffKey] = slug.split('-')
  const bucket = dataset[diffKey as MazeDifficulty]
  if (!bucket) return null
  return bucket.find(m => m.slug === slug) ?? null
}

export function getAllSlugs(): string[] {
  return getAllMazes().map(m => m.slug)
}
