# ほいくぷりんと 設計ドキュメント

## コンセプト
「保育現場支援サービス」= 塗り絵サイトではなく保育インフラ
UX核心: **「考えなくていい」** = 迷わず・すぐ使える・すぐ印刷

## 技術スタック
- Next.js 15 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui
- 静的データ(JSON) → 将来DB移行想定
- GitHub + Vercel デプロイ

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

## 拡張ロードマップ
1. v1: 静的サイト (現在)
2. v2: 会員制・お気に入り保存
3. v3: AI教材提案・保育士レビュー
4. v4: 月齢別提案・保育AIアシスタント
