# ぬりえ量産ルール（全環境共通）

> **このファイルが唯一の正：** 別PCでも `git pull` するだけで最新ルールを参照できる。
> ルールを変更したら必ずここを更新してコミットすること。

---

## 生成エンジン選択

| テーマ | エンジン | 理由 |
|---|---|---|
| 恐竜・公園 | ChatGPT ブラウザ（Playwright CDP） | 線画品質が gpt-image-2 より高い |
| 動物・虫・乗り物 | OpenAI API（gpt-image-2） | 自動化が簡単・コスト低 |

---

## ChatGPT ブラウザ生成ルール

### レート制限（ChatGPT Plus）
- **3時間ローリングウィンドウで40〜50リクエスト**（1日N枚制限ではない）
- 最大スループット: 生成90秒 + `INTER_REQUEST_SLEEP=180秒` = 270秒/枚 = **最大約320枚/日**
- 制限に近づくと ERROR_PHRASES を検知 → 自動60秒待機してリトライ

### Chrome・セッション管理
- **Chromeタブは常に1つだけ** — 複数タブでChatGPTを開くとレート制限を早く消費する
- **セッションはこまめに削除** — スクリプト内 `delete_current_chat()` が自動削除するが、手動で他セッションが残っている場合は事前に消去する

### 起動手順
```bash
# Chrome をCDPモードで起動（毎回必要）
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.chatgpt-chrome-profile"

python3 scripts/generate_chatgpt.py --type park --all
python3 scripts/generate_chatgpt.py --type dinosaurs --item tyrannosaurus
```

### エラー回復（自動3段階）
1. 通常: max_retries=3
2. ① 60秒クールダウン → 再試行
3. ② Chrome kill → 再起動 → CDP再接続 → 再試行
4. ③ スキップ → `failed_ids.txt` 記録 + macOS通知

---

## OpenAI API 生成ルール（gpt-image-2）

- モデル: `gpt-image-2`、サイズ: `1536x1024`、quality: `medium`、n=1
- **n=4で全難易度を1プロンプトにするとコマ割りになる → n=1で4回別々に呼ぶ**
- コスト: 約$0.053/枚、1テーマ4枚で約$0.21
- スクリプト: `scripts/batch_new_animals.py --themes "fennec,meerkat,..."`
- **並列化**: `--themes` を4グループに分割して4プロセス同時起動（fcntlロック済み）

---

## プロンプト共通ルール

### 必須条件（全テーマ共通）
```
背景は必ず純白 #FFFFFF
線画スタイル（塗りつぶしなし）
輪郭線は太くはっきりと描き、細い線や掠れた線は使わない
A4横長・高画質
文字・テキスト・ラベル・枠線・フレームは一切入れない
イラスト1点のみ・コマ割りや複数構成にしない
```

### 難易度別構図パターン
| 難易度 | 対象年齢 | 構図 |
|---|---|---|
| simple | 2〜3歳 | 対象1体のみ・背景なし・余白たっぷり |
| easy | 3歳 | 簡単な場面・シンプルな背景 |
| normal | 3〜5歳 | 親子や複数体・場所がわかる背景 |
| rich | 4〜6歳 | 家族・にぎやかな背景（木・太陽・建物等点在） |

### 過去の失敗と対策
- 英語プロンプト → 品質低下。**日本語プロンプト必須**
- 乗り物に顔がついた → 「車両やのりものに顔はつけない」を追加
- 縞模様（シマウマ等）は「黒く塗りつぶさず輪郭線のみ」と明記

---

## 背景純白化（生成後の後処理）

PIL を使って近白色（RGB各チャンネル≥235）を #FFFFFF に統一。
```python
mask = (arr[:,:,0] >= 235) & (arr[:,:,1] >= 235) & (arr[:,:,2] >= 235)
arr[mask] = [255, 255, 255]
```

---

## 並列生成（別環境での分担）

- 同リポジトリを別PCにcloneして同じセットアップ
- **テーマ単位で環境を分担**（同じテーマを複数環境で同時生成しない）
- data.ts への書き込みは `fcntl.LOCK_EX` でロック（競合回避）
- git push 前に `git pull --rebase` を実行

---

## Vercel デプロイ上限対策

- Hobby プラン: **100デプロイ/日**（mainへのpush1回=1デプロイ）
- **バッチ処理中は途中でpushしない → 最後に1回だけpush**
- やむを得ず都度pushが必要な場合はユーザーに事前報告
- 上限超過時: 翌日JST 9:00（UTC 0:00）にリセット

---

## 環境セットアップ（別PC）

```bash
git clone https://github.com/Daiki-Morishita/hoiku-print.git
cd hoiku-print
pip install playwright supabase pillow numpy openai
playwright install chromium
export SUPABASE_SECRET_KEY=<サービスロールキー>
export SUPABASE_URL=https://hdhogsjmdowevijxooiq.supabase.co
export OPENAI_API_KEY=<APIキー>
# または .env.local に記載（スクリプトが自動読み込み）
```
