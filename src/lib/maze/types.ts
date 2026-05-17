/**
 * 迷路カテゴリ専用の型定義
 * docs/structure.md / docs/terms.md を参照
 */

export type MazeDifficulty = 'easy' | 'normal' | 'hard' | 'expert'

export type MazeRecord = {
  slug: string                       // e.g. "normal-001"
  difficulty: MazeDifficulty
  difficulty_label: string           // "ふつう" 等
  age_label: string                  // "3・4さい" 等
  age_min: number
  age_max: number
  no: number                         // 連番（難易度内で1始まり）
  cols: number
  rows: number
  seed: number
  turns: number                      // 最短経路の曲がり回数
  path_length: number                // 最短経路のセル数
  walls: string[][][]                // walls[x][y] = ['N','S',...]
  solution: [number, number][]       // 最短経路の座標列
}

export type MazeDataset = Record<MazeDifficulty, MazeRecord[]>

export const MAZE_DIFFICULTY_ORDER: MazeDifficulty[] = ['easy', 'normal', 'hard', 'expert']

export const MAZE_DIFFICULTY_LABELS: Record<MazeDifficulty, string> = {
  easy: 'かんたん',
  normal: 'ふつう',
  hard: 'むずかしい',
  expert: 'とてもむずかしい',
}
