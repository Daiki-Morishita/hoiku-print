/**
 * 迷路カテゴリ専用の型定義
 */

export type MazeShape = 'square' | 'circle' | 'triangle-up' | 'triangle-down'
export type MazeDifficulty = 'easy' | 'normal' | 'hard' | 'expert'
export type WallSide = 'N' | 'S' | 'E' | 'W'

export type PolarSide = 'IN' | 'OUT' | 'CW' | 'CCW'

/** grid系 (square / triangle系) */
export type GridMazeRecord = {
  slug: string
  shape: 'square' | 'triangle-up' | 'triangle-down'
  shape_label: string
  difficulty: MazeDifficulty
  difficulty_label: string
  age_label: string
  age_min: number
  age_max: number
  no: number
  cols: number
  rows: number
  seed: number
  turns: number
  path_length: number
  walls: string[][][]
  valid: boolean[][]
  solution: [number, number][]
  start_cell: [number, number]
  goal_cell: [number, number]
  start_side: WallSide
  goal_side: WallSide
}

/** Polar (真の円形) maze */
export type CircleMazeRecord = {
  slug: string
  shape: 'circle'
  shape_label: string
  difficulty: MazeDifficulty
  difficulty_label: string
  age_label: string
  age_min: number
  age_max: number
  no: number
  rings: number
  sectors: number
  seed: number
  turns: number
  path_length: number
  circle_walls: string[][][]         // [ring][sector] = ['IN','OUT','CW','CCW']
  solution: [number, number][]      // [ring, sector] のペア
  start_cell: [number, number]      // [ring, sector]
  goal_cell: [number, number]
  start_side: PolarSide
  goal_side: PolarSide
}

export type MazeRecord = GridMazeRecord | CircleMazeRecord

export function isCircleMaze(m: MazeRecord): m is CircleMazeRecord {
  return m.shape === 'circle'
}

/** JSON 全体の構造: shape -> difficulty -> records */
export type MazeDataset = Record<MazeShape, Record<MazeDifficulty, MazeRecord[]>>

export const MAZE_SHAPE_ORDER: MazeShape[] = ['square', 'circle', 'triangle-up', 'triangle-down']

export const MAZE_DIFFICULTY_ORDER: MazeDifficulty[] = ['easy', 'normal', 'hard', 'expert']

export const MAZE_DIFFICULTY_LABELS: Record<MazeDifficulty, string> = {
  easy: 'かんたん',
  normal: 'ふつう',
  hard: 'むずかしい',
  expert: 'とてもむずかしい',
}

export const MAZE_SHAPE_LABELS: Record<MazeShape, string> = {
  square: 'しかくのめいろ',
  circle: 'まるのめいろ',
  'triangle-up': 'さんかくのめいろ（上むき）',
  'triangle-down': 'さんかくのめいろ（下むき）',
}

export const MAZE_SHAPE_SHORT: Record<MazeShape, string> = {
  square: 'しかく',
  circle: 'まる',
  'triangle-up': 'さんかく ▲',
  'triangle-down': 'さんかく ▼',
}
