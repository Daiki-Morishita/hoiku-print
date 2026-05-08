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
  {
    id: 'dog-simple',
    title: 'おすわりかわいいこいぬ',
    description: '首輪をつけたかわいい子犬がおすわりしているシンプルなぬりえ。小さなお子様にぴったりです。',
    ageMin: 2, ageMax: 3, difficulty: 1, duration: 10,
    category: 'coloring', theme: 'animals',
    tags: ['いぬ', 'こいぬ', 'どうぶつ', 'かわいい', 'ペット'],
    tools: ['クレヨン'],
    activityIdeas: [
      '茶色や白など好きな色で子犬を塗ってみよう',
      '首輪を好きな色にカラフルに塗って自分だけの子犬を作ろう',
    ],
    imageUrl: '/materials/dog-simple-illust.png', illustUrl: '/materials/dog-simple-illust.png',
    illustVersion: 1, imageStatus: 'pending_review', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'dog-normal',
    title: 'いぬとおうち',
    description: 'かわいい子犬と犬小屋、お日さまや蝶々が描かれた楽しいぬりえです。',
    ageMin: 3, ageMax: 4, difficulty: 1, duration: 15,
    category: 'coloring', theme: 'animals',
    tags: ['いぬ', '動物', '犬小屋', 'ちょうちょ', 'おひさま'],
    season: 'spring',
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: [
      '色を塗りながら犬の鳴き声を真似してみよう',
      '自分のペットや好きな動物について話してみよう',
    ],
    imageUrl: '/materials/dog-normal-illust.png', illustUrl: '/materials/dog-normal-illust.png',
    illustVersion: 1, imageStatus: 'pending_review', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'dog-rich',
    title: 'わんちゃんいっぱい！たのしいこうえん',
    description: 'たくさんの可愛い子犬たちが公園で遊ぶ賑やかなぬりえ。風車や虹、滑り台など細かい要素が満載です。',
    ageMin: 4, ageMax: 6, difficulty: 3, duration: 30,
    category: 'coloring', theme: 'animals',
    tags: ['いぬ', 'こうえん', 'どうぶつ', 'あそび', 'にじ'],
    tools: ['クレヨン', '色鉛筆', 'サインペン'],
    activityIdeas: [
      '好きな子犬を選んで名前をつけてみよう',
      '虹の色を順番通りに塗って色の勉強をしよう',
    ],
    imageUrl: '/materials/dog-rich-illust.png', illustUrl: '/materials/dog-rich-illust.png',
    illustVersion: 1, imageStatus: 'pending_review', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'rabbit-simple-1',
    title: 'かわいいうさぎさん',
    description: 'おすわりしているかわいい赤ちゃんうさぎのぬりえ。大きな耳とぷっくりした手足が魅力的です。',
    ageMin: 2, ageMax: 3, difficulty: 1, duration: 10,
    category: 'coloring', theme: 'animals',
    tags: ['うさぎ', '動物', 'かわいい', 'シンプル', '赤ちゃん'],
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: [
      'うさぎの好きな食べ物について話しながら塗ってみよう',
      'ピンクや白などお気に入りの色でうさぎさんを自由に塗ってみよう',
    ],
    imageUrl: '/materials/rabbit-simple-illust.png', illustUrl: '/materials/rabbit-simple-illust.png',
    illustVersion: 1, imageStatus: 'pending_review', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'rabbit-easy-1',
    title: 'うさぎとにんじんとイースターバスケット',
    description: 'にんじんを抱えたかわいいうさぎとイースターエッグの入ったかごのぬりえです。',
    ageMin: 3, ageMax: 3, difficulty: 1, duration: 10,
    category: 'coloring', theme: 'animals',
    tags: ['うさぎ', 'にんじん', 'イースター', '動物', 'かご'],
    season: 'spring',
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: [
      'うさぎの体の色を自由に塗って、オリジナルのうさぎを作ってみよう',
      'イースターエッグに好きな模様を描き足してデコレーションしよう',
    ],
    imageUrl: '/materials/rabbit-easy-illust.png', illustUrl: '/materials/rabbit-easy-illust.png',
    illustVersion: 1, imageStatus: 'pending_review', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'rabbit-normal-1',
    title: 'にんじんを持つうさぎとイースター',
    description: 'リボンをつけたうさぎがにんじんを持ち、卵やお花に囲まれた春らしいぬりえです。',
    ageMin: 3, ageMax: 4, difficulty: 2, duration: 15,
    category: 'coloring', theme: 'animals',
    tags: ['うさぎ', 'にんじん', 'イースター', 'たまご', 'ちょうちょ', 'チューリップ', '春'],
    season: 'spring',
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: [
      'うさぎの好きな食べ物についてお話ししてみよう',
      'イースターエッグに自由な模様を描いてオリジナルの卵を作ろう',
    ],
    imageUrl: '/materials/rabbit-normal-illust.png', illustUrl: '/materials/rabbit-normal-illust.png',
    illustVersion: 1, imageStatus: 'pending_review', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
  {
    id: 'rabbit-rich-1',
    title: 'うさぎたちの楽しい公園あそび',
    description: 'うさぎたちが池でボートに乗ったり、すべり台で遊んだりする賑やかな公園の風景です。',
    ageMin: 4, ageMax: 6, difficulty: 2, duration: 20,
    category: 'coloring', theme: 'animals',
    tags: ['うさぎ', '公園', 'ボート', 'すべり台', 'お花', '動物'],
    season: 'spring',
    tools: ['クレヨン', '色鉛筆'],
    activityIdeas: [
      'うさぎごとに違う色を使って塗り分けてみよう',
      '塗り終わったら、うさぎたちのお話を考えて発表しよう',
    ],
    imageUrl: '/materials/rabbit-rich-illust.png', illustUrl: '/materials/rabbit-rich-illust.png',
    illustVersion: 1, imageStatus: 'pending_review', pdfUrl: '', createdAt: '2026-05-08', popular: false,
  },
]

export type SortKey = 'newest' | 'popular' | 'favorites'

// フィルタリング関数
export function filterMaterials(params: {
  age?: number
  category?: string
  season?: string
  event?: string
  theme?: string
  difficulty?: number
  search?: string
  sort?: SortKey
  favoriteIds?: string[]
}): Material[] {
  const filtered = materials.filter(m => {
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

  const sort = params.sort ?? 'newest'

  if (sort === 'popular') {
    return [...filtered].sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1
      const da = b.downloadCount ?? 0
      const db = a.downloadCount ?? 0
      if (da !== db) return da - db
      return b.createdAt.localeCompare(a.createdAt)
    })
  }

  if (sort === 'favorites' && params.favoriteIds) {
    const favSet = new Set(params.favoriteIds)
    return [...filtered].sort((a, b) => {
      const af = favSet.has(a.id) ? 1 : 0
      const bf = favSet.has(b.id) ? 1 : 0
      if (af !== bf) return bf - af
      return b.createdAt.localeCompare(a.createdAt)
    })
  }

  // newest（デフォルト）
  return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
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
