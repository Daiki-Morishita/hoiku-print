<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## ブラウザ自動化・ボット検知回避ルール

`scripts/generate_chatgpt.py` を含むブラウザ自動化スクリプトを書く・改修するときは
`~/.claude/CLAUDE.md` の「ブラウザ自動化 / ボット検知回避」セクションを参照すること。

### このプロジェクト固有の実装

- `build_prompt(scene, note, cond_items)` — 20スタイルランダム選択
- `attach_rate_limit_guard(page)` — 429 Fail-Fast リスナー
- `make_daily_schedule(n_items, hours)` — 24h分散スケジューラー
- `jitter_sleep(max, rate_limited, success_count)` — 慣らし運転対応バックオフ
- `human_pause / human_move_and_click / human_type` — 人間らしい操作ヘルパー

### 実験メモ

- `--daily 100` で 100ユニット / 24h 分散実験（初回）
- 制限なし → 翌日 `--daily-hours` を短縮してインターバルを詰める
