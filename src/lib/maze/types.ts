/**
 * 迷路カテゴリ専用の型定義
 */

export type MazeShape = 'square' | 'circle' | 'triangle-up' | 'triangle-down'
export type MazeDifficulty = 'easy' | 'normal' | 'hard' | 'expert'
export type WallSide = 'N' | 'S' | 'E' | 'W'

export type MazeRecord = {
  slug: string                       // e.g. "square-normal-001"
  shape: MazeShape
  shape_label: string                // "しかくのめいろ" 等
  difficulty: MazeDifficulty
  difficulty_label: string           // "ふつう" 等
  age_label: string                  // "3・4さい" 等
  age_min: number
  age_max: number
  no: number
  cols: number
  rows: number
  seed: number
  turns: number
  path_length: number
  walls: string[][][]                // walls[x][y] = ['N','S',...]
  valid: boolean[][]                 // valid[x][y] = セルが形内か
  solution: [number, number][]
  start_cell: [number, number]
  goal_cell: [number, number]
  start_side: WallSide
  goal_side: WallSide
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
