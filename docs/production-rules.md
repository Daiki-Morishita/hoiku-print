# ぬりえ量産ルール（全環境共通）

> **このファイルが唯一の正：** 別PCでも `git pull` するだけで最新ルールを参照できる。
> ルールを変更したら必ずここを更新してコミットすること。

## このファイルをいつ読むか

AIアシスタントは以下のタイミングで必ず `git pull` してこのファイルを読み直すこと。

- **初回生成前**（セッション開始後、最初に生成作業を行うとき）
- **日付が変わったとき**（前回読んだ日と今日の日付が異なる場合）

複数のPCから随時更新されるため、読まずに作業を始めると古いルールで生成してしまう可能性がある。

---

## 生成エンジン選択

- **全テーマ共通: ChatGPT ブラウザ（Playwright CDP）を使用する**
- OpenAI API（gpt-image-2）は使用しない

---

## ChatGPT アカウント割り当て

複数アカウントでレート制限を分散させる。**PC ごとにアカウントを固定する。**

| PC | アカウント名 | Chrome プロファイル |
|---|---|---|
| メインPC（Daiki） | Morishita Daiki | `~/.chatgpt-chrome-profile` |
| サブPC（Akane） | Morishita Akane | `~/.chatgpt-chrome-profile` |

- 同じテーマを2アカウントで同時生成してOK（ファイルIDが被らなければ競合しない）
- アカウントを間違えたままスクリプトを走らせないこと

---

## ChatGPT ブラウザ生成ルール

### レート制限（ChatGPT Plus）
- **3時間ローリングウィンドウで40〜50リクエスト**（1日N枚制限ではない）
- インターバル: **45〜90秒のランダムジッター**（自動化っぽさを減らす）
- レート制限検知時: インターバル上限を**2倍に自動拡大**（最大720秒）、以降は拡大後の値で維持
- 実装: `jitter_sleep(current_max, rate_limited)` — `generate_chatgpt.py` 参照

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

### 就寝時・長時間放置（ディスプレイOFF運用）

スクリプト実行中に画面だけ消して離席・就寝できる。

```bash
# Mac本体のスリープを防止しつつディスプレイだけOFF
caffeinate -i &          # システムスリープ防止（バックグラウンド）
pmset displaysleepnow    # ディスプレイ即時OFF
```

- ディスプレイOFFでもChrome・Pythonスクリプトは動き続ける
- 復帰はマウス・キーボードを触るだけ
- 起床後は `kill %1`（または `killall caffeinate`）でcaffeinateを停止
- Claude に「寝ます」または「画面OFF」と言えば上記を実行する

### エラー回復（自動3段階）
1. 通常: max_retries=3
2. ① 60秒クールダウン → 再試行
3. ② Chrome kill → 再起動 → CDP再接続 → 再試行
4. ③ スキップ → `failed_ids.txt` 記録 + macOS通知

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
| simple | 2〜3歳 | 対象1個のみ・背景なし・余白たっぷり |
| easy | 3歳 | **丸ごと1個 ＋ 日常でよく見る形（剥いた状態・切り方・食べ方など）を添える** |
| normal | 3〜5歳 | 複数個・場所がわかる背景（木・かご・畑など） |
| rich | 4〜6歳 | にぎやかな背景（関連するものが点在） |

**easyの補足（食べ物テーマ）:**
生活の中で子どもが目にする形を見せる。「切ったらこうなる」「剥いたらこうなる」という発見を促す構図。
必ずしも「切る」でなくてよい。その食べ物として食べるときによく見る形を選ぶ。
例: バナナ → 皮つき1本 ＋ 皮をむいた状態、すいか → 丸ごと1玉 ＋ くし形スライス

### 過去の失敗と対策
- 英語プロンプト → 品質低下。**日本語プロンプト必須**
- 乗り物に顔がついた → 「車両やのりものに顔はつけない」を追加
- 縞模様（シマウマ等）は「黒く塗りつぶさず輪郭線のみ」と明記
- 食べ物（果物・野菜）に顔・目・口などの表情はつけない

---

## 背景純白化（生成後の後処理）

PIL を使って近白色（RGB各チャンネル≥235）を #FFFFFF に統一。
```python
mask = (arr[:,:,0] >= 235) & (arr[:,:,1] >= 235) & (arr[:,:,2] >= 235)
arr[mask] = [255, 255, 255]
```

---

## テーマ数の方針

- テーマ数に上限は設けない
- 一般的なアイテム（動物・食べ物・乗り物・遊具など）の範囲内であれば、思いつく限り追加してよい
- リストアップ時に「何件まで」と制限しない

---

## 並列生成（別環境での分担）

- 同リポジトリを別PCにcloneして同じセットアップ
- **テーマ単位で環境を分担**（同じテーマを複数環境で同時生成しない）
- data.ts への書き込みは `fcntl.LOCK_EX` でロック（競合回避）
- git push 前に `git pull --rebase` を実行

---

## Vercel デプロイ上限対策

- Hobby プラン: **100デプロイ/日**（mainへのpush1回=1デプロイ）
- 上限超過時: 翌日JST 9:00（UTC 0:00）にリセット

### push ルール（必須）

| 実行モード | commitタイミング | pushタイミング |
|---|---|---|
| `--all`（バッチ） | テーマ完了ごと | **最後に1回だけ** |
| `--item`（単体） | 完了後すぐ | 完了後すぐ |

- `--all` 中は `git commit` のみ行い `git push` しない
- 全テーマ完了後に `git pull --rebase && git push` を1回実行
- 1日の目安: **セッション単位で1〜数回のpushに抑える**

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
