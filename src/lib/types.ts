export type AgeGroup = 2 | 3 | 4 | 5 | 6

export type Difficulty = 1 | 2 | 3 | 4

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

// ========== イラスト素材管理 ==========

/**
 * イラストの管理ステータス
 *
 * placeholder    : SVGの線画のみ（AIイラスト未設定）
 * pending_review : AIイラストを配置済み・レビュー待ち
 * approved       : レビュー済み・本番使用OK
 * needs_revision : 要修正（差し替え待ち）
 */
export type ImageStatus = 'placeholder' | 'pending_review' | 'approved' | 'needs_revision'

export const IMAGE_STATUS_LABELS: Record<ImageStatus, string> = {
  placeholder:    'SVGのみ',
  pending_review: 'レビュー待ち',
  approved:       '承認済み',
  needs_revision: '要修正',
}

export const IMAGE_STATUS_COLOR: Record<ImageStatus, string> = {
  placeholder:    'bg-gray-100 text-gray-600',
  pending_review: 'bg-yellow-100 text-yellow-700',
  approved:       'bg-green-100 text-green-700',
  needs_revision: 'bg-red-100 text-red-700',
}

// ========== 教材 ==========

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
  /** SVG塗り絵ファイルのパス（常に存在する） */
  imageUrl: string
  /** 印刷用SVGのパス */
  pdfUrl: string
  createdAt: string
  popular: boolean
  downloadCount?: number

  // ── イラスト素材管理フィールド ──────────────────────────
  /** AIイラスト画像のパス（例: /materials/cat-simple-illust.jpg） */
  illustUrl?: string
  /** イラストのバージョン番号（差し替えのたびに +1） */
  illustVersion?: number
  /** 管理ステータス */
  imageStatus?: ImageStatus
  /** レビューメモ（修正指示や承認コメントなど） */
  illustNotes?: string
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'やさしい',
  2: 'ふつう',
  3: 'むずかしい',
  4: 'とてもむずかしい',
}
