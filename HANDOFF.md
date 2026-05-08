# 引き継ぎ資料 — ぬりえプリント開発ログ

最終更新: 2026-05-08

---

## プロジェクト概要

**サイト名**: ぬりえプリント  
**URL**: https://nurie.vercel.app  
**GitHub**: https://github.com/Daiki-Morishita/hoiku-print  
**Vercel project**: nurie-print  
**スタック**: Next.js 16 App Router / TypeScript / Tailwind CSS v4  
**GA4**: G-TFK69QCK70（layout.tsx に設置済み）

---

## 現在の素材一覧（data.ts 登録済み）

| ID | タイトル | 状態 |
|---|---|---|
| bear-simple-1 | リボンをつけたかわいいくまさん | approved |
| bear-easy-1 | くまさんとはちみつ | approved |
| bear-normal-1 | くまさんのピクニック | approved |
| bear-rich-1 | くまさんたちの公園あそび | approved |
| cat-simple | リボンをつけたねこちゃん | approved |
| cat-easy | ねこときんぎょばち | approved |
| cat-normal | かわいいねこちゃん | approved |
| cat-rich | ねこたちの公園あそび | approved |

---

## 生成済みだが未登録の素材

以下の画像ファイルは `public/materials/` に存在するが `data.ts` に未登録。  
必要なら snippet ファイルを参照して追加する。

- `dog-simple-illust.png` / `dog-normal-illust.png` / `dog-rich-illust.png`
  - Snippet: `scripts/output/snippets-1778219207259.txt`（dog-simple / dog-normal / dog-rich）

---

## 自動生成パイプライン

```bash
# テーマ指定で実行
node scripts/generate-materials.mjs --theme "うさぎ"

# 複数テーマ
node scripts/generate-materials.mjs --theme "うさぎ,いぬ"
```

**処理フロー**:
1. `chatgpt-image-latest`（OpenAI）で線画 PNG 生成（1536×1024, quality:high）
2. `claude-opus-4-7` で画像分析 → メタデータ JSON 生成
3. `public/materials/` に保存
4. **Claude に漢字表記を問い合わせ → `src/lib/utils.ts` の `KANJI_MAP` を自動更新**
5. `scripts/output/snippets-*.txt` にスニペット出力
6. `scripts/cost-ledger.md` にコスト記録

**スニペット出力後の手順**:
```
scripts/output/snippets-*.txt の内容を
src/lib/data.ts の materials 配列末尾にコピペ
→ git add / commit / push
→ Vercel が自動デプロイ
```

**コスト目安**: $0.10/枚（画像 $0.08 + Claude分析 $0.02）× 4枚 = **$0.40/テーマ**

---

## ネーミングルール

| 種別 | 形式 | 例 |
|---|---|---|
| 素材ID | `{テーマ英語}-{バリアント}-{連番}` | `bear-simple-1` |
| 画像ファイル | `{テーマ英語}-{バリアント}-illust.png` | `bear-simple-illust.png` |

**バリアント定義**:
- `simple`: キャラ1体・背景なし（2〜3歳）
- `easy`: キャラ1体＋関連要素1つ（3歳）
- `normal`: キャラ1体＋関連要素2〜3つ（3〜4歳）
- `rich`: 複数キャラ＋背景（4〜6歳）

---

## 検索正規化（実装済み）

`src/lib/utils.ts` の `normalizeQuery` / `normalizeText` で実現。  
「熊」「クマ」「くま」いずれで検索しても同じ結果を返す。

- **カタカナ → ひらがな**: `kanaToHira()` で自動変換
- **漢字 → ひらがな**: `KANJI_MAP` 辞書で変換
- **KANJI_MAP の自動更新**: テーマ生成時に Claude が漢字表記を判定して自動追記

---

## 主要ファイル

| ファイル | 役割 |
|---|---|
| `src/lib/data.ts` | 素材データ一覧・フィルター関数 |
| `src/lib/utils.ts` | 検索正規化（KANJI_MAP含む） |
| `src/lib/types.ts` | 型定義 |
| `scripts/generate-materials.mjs` | 自動生成スクリプト |
| `scripts/cost-ledger.md` | 生成コスト帳簿 |
| `scripts/output/snippets-*.txt` | 生成済みスニペット（未登録分も含む） |
| `src/app/api/admin/analyze-image/route.ts` | Claude Vision API ルート |

---

## 環境変数（.env.local）

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 次にやること

1. **いぬ**の素材を登録（snippets-1778219207259.txt に dog-simple/normal/rich あり。easy は未生成）
2. **うさぎ**を生成（ユーザーが「go」を出したら実行）
3. テーマをどんどん追加していく（ALL_THEMES リストに60件以上定義済み）

---

## コスト累計

| テーマ | 枚数 | コスト |
|---|---|---|
| くま | 4枚 | $0.40 |
| ねこ（登録済み） | 4枚 | 未記録 |
| **合計** | **8枚** | **~$0.80** |
