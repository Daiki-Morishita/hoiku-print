# ぬりえプリント 設計ドキュメント

## コンセプト
「保育現場支援サービス」= 塗り絵サイトではなく保育インフラ
UX核心: **「考えなくていい」** = 迷わず・すぐ使える・すぐ印刷

## 技術スタック
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui
- 静的データ(TypeScript) → 将来DB移行想定
- GitHub + Vercel デプロイ
- フォント: `next/font/google` (Noto_Sans_JP) — CSS @import 禁止(Turbopack panic)

## カラーパレット
```
プライマリ: #5B9BD5 (穏やかブルー)
アクセント: #FF8C69 (やさしいサーモン)
グリーン: #6BBF7C (安心グリーン)
背景: #FAFAF9 (ウォームホワイト)
テキスト: #1F2937 (ダークグレー)
サブテキスト: #6B7280
ボーダー: #E5E7EB
```

## フォント
- 日本語: Noto Sans JP (Google Fonts)
- 数字/英字: Inter

## ディレクトリ構成
```
src/
├── app/
│   ├── page.tsx              # トップページ
│   ├── materials/
│   │   ├── page.tsx          # 一覧・検索
│   │   └── [id]/page.tsx     # 詳細・印刷
│   ├── category/
│   │   └── [type]/[value]/page.tsx  # カテゴリ一覧
│   └── api/
├── components/
│   ├── ui/                   # shadcn
│   ├── layout/               # Header, Footer
│   ├── materials/            # MaterialCard, PrintButton
│   └── search/               # SearchBar, FilterPanel
├── lib/
│   ├── data.ts               # コンテンツデータ
│   ├── types.ts              # 型定義
│   └── utils.ts
└── public/
    └── materials/            # 教材画像・PDF
```

## データモデル
```typescript
type Material = {
  id: string
  title: string
  description: string
  ageMin: number      // 2-6歳
  ageMax: number
  difficulty: 1|2|3  // やさしい/ふつう/むずかしい
  duration: 5|10|15|20|30  // 分
  category: Category
  tags: string[]
  season?: Season
  event?: string
  tools: string[]    // 必要道具
  activityIdeas: string[]  // 活動提案
  imageUrl: string
  pdfUrl: string
  createdAt: string
  popular: boolean
}
```

## SEO戦略
- ロングテール: 「3歳 ぬりえ」「保育園 夏祭り 塗り絵」
- 各ページ固有メタデータ
- sitemap.xml自動生成
- 構造化データ(JSON-LD)

## 印刷UX (最重要)
- CSS: `@media print` でナビ非表示、A4最適化
- 白黒印刷最適化 (グレースケール)
- インク節約: 背景なし
- 名前欄付きレイアウト

## 実装済みSVG教材 (public/materials/)
| ファイル | 内容 | 対象年齢 |
|---|---|---|
| cat-simple.svg | ねこ ぬりえ | 2歳〜 |
| bear-simple.svg | くま ぬりえ | 2歳〜 |
| apple-simple.svg | りんご ぬりえ | 2歳〜 |
| dinosaur-trex.svg | ティラノサウルス | 3-5歳 |
| tanabata-star.svg | 七夕 ぬりえ | 3-6歳 |
| maze-easy.svg | かんたん迷路 | 2-4歳 |
| hiragana-a-line.svg | あ行 なぞり書き | 4-6歳 |

## トップページ構成 (page.tsx)
Hero → 状況で探す(6カード) → 年齢で探す → 種類で探す →
2歳向け特集 → 人気教材 → 季節・行事 → CTA

## 注意事項
- SVG印刷: `<img>`タグ使用(next/image は印刷不可)
- 印刷レイアウト: `print:hidden` / `hidden print:block` で画面/印刷切替
- 検索: URL query params経由 (?age=3&category=coloring 等)

## 拡張ロードマップ
1. v1: 静的サイト (現在) — 23教材、SVGぬりえ7種
2. v2: 教材追加(クリスマス・ハロウィン・数字・アルファベット)
3. v3: 会員制・お気に入り保存
4. v4: AI教材提案・保育士レビュー
5. v5: 月齢別提案・保育AIアシスタント
