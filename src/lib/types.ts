export type AgeGroup = 2 | 3 | 4 | 5 | 6

export type Difficulty = 1 | 2 | 3

export type Duration = 5 | 10 | 15 | 20 | 30

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type Category =
  | 'coloring'      // ぬりえ
  | 'hiragana'      // ひらがな
  | 'numbers'       // 数字
  | 'drawing'       // 運筆
  | 'maze'          // 迷路
  | 'dotconnect'    // 点つなぎ
  | 'craft'         // 工作
  | 'scissors'      // ハサミ練習

export type Theme =
  | 'animals'       // 動物
  | 'dinosaurs'     // 恐竜
  | 'vehicles'      // はたらくくるま
  | 'trains'        // 電車
  | 'food'          // 食べ物
  | 'sea'           // 海の生き物
  | 'insects'       // 虫
  | 'flowers'       // 花・植物
  | 'characters'    // キャラクター風

export const CATEGORY_LABELS: Record<Category, string> = {
  coloring: 'ぬりえ',
  hiragana: 'ひらがな',
  numbers: '数字・数え方',
  drawing: '運筆',
  maze: '迷路',
  dotconnect: '点つなぎ',
  craft: '工作',
  scissors: 'ハサミ練習',
}

export const THEME_LABELS: Record<Theme, string> = {
  animals: '動物',
  dinosaurs: '恐竜',
  vehicles: 'はたらくくるま',
  trains: '電車・乗り物',
  food: '食べ物',
  sea: '海の生き物',
  insects: '虫',
  flowers: '花・植物',
  characters: 'キャラクター風',
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

export const EVENT_LABELS: Record<string, string> = {
  tanabata: '七夕',
  setsubun: '節分',
  summerfestival: '夏祭り',
  halloween: 'ハロウィン',
  christmas: 'クリスマス',
  hinamatsuri: 'ひな祭り',
  sports: '運動会',
  graduation: '卒園式・入園式',
  mothers: '母の日',
  fathers: '父の日',
}

export type Material = {
  id: string
  title: string
  description: string
  ageMin: AgeGroup
  ageMax: AgeGroup
  difficulty: Difficulty
  duration: Duration
  category: Category
  theme?: Theme
  tags: string[]
  season?: Season
  event?: string
  tools: string[]
  activityIdeas: string[]
  imageUrl: string
  pdfUrl: string
  createdAt: string
  popular: boolean
  downloadCount?: number
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'やさしい',
  2: 'ふつう',
  3: 'むずかしい',
}
