# めいろカテゴリ 統合ガイド

迷路カテゴリ（`/maze`）の実装が完了。デザインセッション側で残作業を引き継ぐためのドキュメント。

---

## 完成しているもの

### ファイル一覧

```
scripts/generate_maze.py              # 迷路ジェネレーター（Python）
src/lib/maze/
  ├─ data.json                        # 生成済み迷路データ（現在20件）
  ├─ types.ts                         # MazeRecord 等の型定義
  ├─ loader.ts                        # JSON から取得するユーティリティ
  └─ svg.ts                           # 迷路SVG・うさぎ・にんじん描画関数
src/app/maze/
  ├─ page.tsx                         # /maze 一覧
  ├─ maze.module.css                  # 専用CSS（他カテゴリ影響なし）
  ├─ MazeSheet.tsx                    # 印刷シート（問題版/答え版共通）
  ├─ PrintButton.tsx                  # client component（window.print()）
  ├─ [slug]/page.tsx                  # /maze/[slug] 詳細
  └─ [slug]/answer/page.tsx           # /maze/[slug]/answer 答え
docs/maze-integration.md              # 本ドキュメント
docs/structure.md                     # 知育サイト全体構造設計（既存）
```

### 動作確認済み

- `/maze` 一覧ページ — 4難易度 × 5枚のサムネイル表示
- `/maze/easy-001` 〜 `/maze/expert-005` 詳細ページ — 印刷シート＋ボタン2つ
- `/maze/{slug}/answer` 答えページ — 解答パスを赤線でオーバーレイ
- 印刷時（@media print）はボタン非表示
- HTTPステータス全て200 OK、ブラウザコンソールエラーなし

---

## 設計仕様

### 難易度（ターン数で厳密保証）

| 難易度 | label | 対象年齢 | グリッド | ターン数 | パス長 |
|---|---|---|---|---|---|
| easy | かんたん | 2・3さい | 6×4 | 3-6 | 10-18 |
| normal | ふつう | 3・4さい | 8×6 | 6-10 | 16-30 |
| hard | むずかしい | 4・5さい | 12×8 | 10-18 | 30-60 |
| expert | とてもむずかしい | 5・6さい | 16×11 | 16-32 | 50-110 |

ジェネレーターは BFS で最短経路を解き、ターン数が範囲外なら別 seed で再生成（最大5000試行）。

### 命名規則

- slug: `{difficulty}-{NNN}`（例: `normal-001`）
- 表示: 「しかくのめいろ ふつう No.001」
- URL: `/maze/normal-001`

将来「うさぎのめいろ」「ぞうのめいろ」など輪郭が絵の形をした迷路も同じ階層で展開可能。

---

## デザインセッション側にお願いしたい統合作業

### 1. ヘッダーナビへの追加（高優先度）

`src/components/layout/Header.tsx`（または該当ファイル）に「めいろ」リンクを追加。

```
[既存] 動物 恐竜 乗り物 海 虫 食べ物 年齢で探す 難易度で探す 読みもの FAQ
[追加] ... + めいろ（新規） + 知育（将来）
```

### 2. トップページからの導線

`src/app/page.tsx` に「めいろプリント」セクション追加（structure.md Phase 1 参照）。

### 3. sitemap.ts への追加

`src/app/sitemap.ts` の return 配列に以下を追加:

```ts
import { getAllSlugs as getAllMazeSlugs } from '@/lib/maze/loader'

// ... 既存配列内
{ url: `${BASE_URL}/maze`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
...getAllMazeSlugs().map(slug => ({
  url: `${BASE_URL}/maze/${slug}`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.7,
})),
```

答えページ（`/answer`）は **robots.noindex** で除外済みなので sitemap には**入れない**。

### 4. 構造化データ（任意）

`/maze/[slug]` に `CreativeWork` + `BreadcrumbList` JSON-LD を追加すると SEO 効果上がる。

---

## ジェネレーター運用

### 追加生成

```bash
# 各難易度を5件→10件に増やす
python3 scripts/generate_maze.py --difficulty all --count 10

# normalだけ50件に
python3 scripts/generate_maze.py --difficulty normal --count 50
```

既存データの後ろに追記される（slug連番は自動継続）。`src/lib/maze/data.json` を直接読みに行くだけなので、ビルド時のデータ取り込みは不要。

### 1日でも100枚以上追加可能

ジェネレーターは Python の純粋アルゴリズム、コスト0円、生成は秒単位。

---

## 触っていない既存ファイル

念のため、以下のファイルは**一切触っていない**:

- `src/app/page.tsx`（トップ）
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/sitemap.ts`
- `src/components/layout/**`（ヘッダー・フッター）
- `src/lib/data.ts`（ぬりえデータ）
- `src/lib/types.ts`（既に `maze` カテゴリが定義済みだったため触る必要なし）
- `tailwind.config.*`

CSS は `src/app/maze/maze.module.css` に完全隔離。他カテゴリに影響なし。

---

## 既知の課題・将来作業

- マスコットキャラ未配置（暫定でうさぎ・にんじんのみ）→ 別途マスコット設計時に統合
- うさぎ/にんじんのSVGはコード生成。プロのイラストに差し替えるなら `src/lib/maze/svg.ts` の `RABBIT_SVG`/`CARROT_SVG` 定数を入れ替えるだけ
- 答えページの URL は `/maze/[slug]/answer`。SEO的に noindex 済み
- 印刷PDFは Next.js では出力していない（ブラウザ印刷ダイアログを使う）。将来 puppeteer サーバーで PDF 直配信したい場合は別途実装
