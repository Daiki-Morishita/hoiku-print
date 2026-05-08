import type { Material, Category, Season, Theme, AgeGroup } from './types'
import { normalizeQuery, normalizeText } from './utils'

export const materials: Material[] = [
  {
    id: 'bear-simple-1',
    title: 'リボンをつけたかわいいくまさん',
    description: '蝶ネクタイをつけて手をふっているかわいいくまさんのぬりえ。シンプルな線で小さなお子様も楽しめます。',
    ageMin: 2, ageMax: 3, difficulty: 1, duration: 10,
    category: 'coloring', theme: 'animals',
    tags: ['くま', '動物', 'リボン', 'かわいい', 'シンプル'],
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: ['好きな色でくまさんを塗ってオリジナルのぬいぐるみを作ろう', '塗ったあとに名前をつけて発表ごっこをしよう'],
    imageUrl: '/materials/bear-simple-illust.png', illustUrl: '/materials/bear-simple-illust.png',
    illustVersion: 1, imageStatus: 'approved', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'bear-easy-1',
    title: 'くまさんとはちみつ',
    description: 'かわいいくまさんとはちみつのつぼ、ハチさんが登場するほっこりぬりえです。',
    ageMin: 3, ageMax: 3, difficulty: 1, duration: 10,
    category: 'coloring', theme: 'animals',
    tags: ['くま', 'はちみつ', 'ハチ', '動物', 'かわいい'],
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: ['茶色や黄色を使ってくまさんとはちみつを塗ってみよう', '塗り終わったら「くまさんは何を食べているのかな?」とお話を広げよう'],
    imageUrl: '/materials/bear-easy-illust.png', illustUrl: '/materials/bear-easy-illust.png',
    illustVersion: 1, imageStatus: 'approved', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'bear-normal-1',
    title: 'くまさんのピクニック',
    description: 'かわいいくまさんがサンドイッチやおにぎりを楽しむピクニックのぬりえです。',
    ageMin: 3, ageMax: 4, difficulty: 2, duration: 15,
    category: 'coloring', theme: 'animals',
    tags: ['くま', 'ピクニック', '動物', '食べ物', 'おにぎり', 'ちょうちょ'],
    season: 'spring',
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: ['ぬりえの後、実際にお弁当を作ってピクニックごっこをしてみよう', 'くまさんが食べている食べ物の名前を一緒に言ってみよう'],
    imageUrl: '/materials/bear-normal-illust.png', illustUrl: '/materials/bear-normal-illust.png',
    illustVersion: 1, imageStatus: 'approved', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'bear-rich-1',
    title: 'くまさんたちの公園あそび',
    description: 'くまの仲間たちが公園で滑り台や砂遊び、池で楽しく遊ぶにぎやかなぬりえです。',
    ageMin: 4, ageMax: 6, difficulty: 2, duration: 20,
    category: 'coloring', theme: 'animals',
    tags: ['くま', '公園', '動物', 'あそび', '夏'],
    season: 'summer',
    tools: ['クレヨン', '色鉛筆', 'サインペン'],
    activityIdeas: ['それぞれのくまに名前と性格をつけてお話を作ってみよう', '自分が公園で遊んだ思い出の色を使って塗ってみよう'],
    imageUrl: '/materials/bear-rich-illust.png', illustUrl: '/materials/bear-rich-illust.png',
    illustVersion: 1, imageStatus: 'approved', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'cat-simple',
    title: 'リボンをつけたねこちゃん',
    description: 'リボンをつけて手をふる、かわいい子猫のぬりえ。シンプルな線で小さなお子様にぴったり。',
    ageMin: 2, ageMax: 3, difficulty: 1, duration: 10,
    category: 'coloring', theme: 'animals',
    tags: ['ねこ', '動物', 'かわいい', 'リボン', '簡単'],
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: ['好きな色でねこちゃんを自由に塗ってみよう', 'リボンの色を考えて塗り、おしゃれなねこちゃんを作ろう'],
    imageUrl: '/materials/cat-simple-illust.png', illustUrl: '/materials/cat-simple-illust.png',
    illustVersion: 1, imageStatus: 'approved', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'cat-easy',
    title: 'ねこときんぎょばち',
    description: 'リボンをつけたかわいいねこと、きんぎょばちのきんぎょをぬるぬりえです。',
    ageMin: 3, ageMax: 3, difficulty: 1, duration: 10,
    category: 'coloring', theme: 'animals',
    tags: ['ねこ', 'きんぎょ', '動物', 'かわいい', 'リボン'],
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: ['ねこの毛色を自由に塗って、自分だけのねこを作ろう', 'きんぎょばちの水を青く塗って、お魚さんの色も考えてみよう'],
    imageUrl: '/materials/cat-easy-illust.png', illustUrl: '/materials/cat-easy-illust.png',
    illustVersion: 1, imageStatus: 'approved', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'cat-normal',
    title: 'かわいいねこちゃん',
    description: 'リボンをつけたねこちゃんが、おさかなやミルク、毛糸玉と一緒にいるぬりえです。',
    ageMin: 3, ageMax: 4, difficulty: 1, duration: 10,
    category: 'coloring', theme: 'animals',
    tags: ['ねこ', '動物', 'かわいい', 'おさかな', 'ミルク', '毛糸'],
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: ['ねこの鳴き声を真似しながら楽しく塗ってみよう', 'ねこが好きな食べ物について話し合いながら塗ろう'],
    imageUrl: '/materials/cat-normal-illust.png', illustUrl: '/materials/cat-normal-illust.png',
    illustVersion: 1, imageStatus: 'approved', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'cat-rich',
    title: 'ねこたちの公園あそび',
    description: 'すべり台や砂遊び、魚釣りを楽しむかわいい子猫たちの賑やかな公園シーンのぬりえです。',
    ageMin: 4, ageMax: 6, difficulty: 2, duration: 20,
    category: 'coloring', theme: 'animals',
    tags: ['ねこ', '公園', 'すべり台', '砂遊び', '夏', '動物'],
    season: 'summer',
    tools: ['クレヨン', '色鉛筆', 'サインペン'],
    activityIdeas: ['猫それぞれに違う毛色を塗って個性を出してみよう', '塗り終わった後にどの猫が何をしているかお話を作ってみよう'],
    imageUrl: '/materials/cat-rich-illust.png', illustUrl: '/materials/cat-rich-illust.png',
    illustVersion: 1, imageStatus: 'approved', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
]

// フィルタリング関数
export function filterMaterials(params: {
  age?: number
  category?: string
  season?: string
  event?: string
  theme?: string
  difficulty?: number
  search?: string
}): Material[] {
  return materials.filter(m => {
    if (params.age && (m.ageMin > params.age || m.ageMax < params.age)) return false
    if (params.category && m.category !== params.category) return false
    if (params.season && m.season !== params.season) return false
    if (params.event && m.event !== params.event) return false
    if (params.theme && m.theme !== params.theme) return false
    if (params.difficulty && m.difficulty !== params.difficulty) return false
    if (params.search) {
      const q = normalizeQuery(params.search)
      const haystack = normalizeText([m.title, m.description, ...m.tags].join(' '))
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function getPopularMaterials(limit = 6): Material[] {
  return materials.filter(m => m.popular).slice(0, limit)
}

export function getMaterialById(id: string): Material | undefined {
  return materials.find(m => m.id === id)
}

export function getRelatedMaterials(material: Material, limit = 4): Material[] {
  return materials
    .filter(m => m.id !== material.id && (
      m.category === material.category ||
      m.theme === material.theme ||
      m.event === material.event
    ))
    .slice(0, limit)
}
