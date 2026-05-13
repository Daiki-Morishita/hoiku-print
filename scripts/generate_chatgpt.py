#!/usr/bin/env python3
"""
ChatGPT画像生成 統合スクリプト（公園・恐竜 共通エンジン）

# =============================================
# ChatGPT Plus レート制限ルール（必読）
# =============================================
# ChatGPT Plusは「1日N枚」制限ではなく、
# 「3時間ローリングウィンドウで40〜50リクエスト」の制限がある。
#
# 最大スループット計算:
#   3時間 ÷ 40リクエスト = 270秒/リクエスト
#   生成待ち時間 ≒ 90秒
#   → INTER_REQUEST_SLEEP = 180秒（生成後の待機）
#   → 合計 270秒/リクエスト = 40req/3hr = 最大320枚/日
#
# 制限検知フレーズ（ERROR_PHRASES）を検知した場合は
# generate_with_recovery() が自動で60秒待機後リトライする。
# =============================================

# 使い方:
#   # 公園テーマを全件生成
#   python3 scripts/generate_chatgpt.py --type park --all
#
#   # 特定アイテムのみ
#   python3 scripts/generate_chatgpt.py --type park --item swing
#
#   # 恐竜テーマを全件生成
#   python3 scripts/generate_chatgpt.py --type dinosaurs --all
#
#   # 特定恐竜のみ
#   python3 scripts/generate_chatgpt.py --type dinosaurs --item tyrannosaurus
#
# 前提:
#   Chrome を CDP モードで起動しておくこと:
#   /Applications/Google Chrome.app/.../Google Chrome
#     --remote-debugging-port=9222
#     --user-data-dir="$HOME/.chatgpt-chrome-profile"
"""

import os, sys, time, re, subprocess, argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
from supabase import create_client

# =============================================
# 設定
# =============================================
INTER_REQUEST_SLEEP = 180  # 生成完了後の待機秒数（40req/3hr制限に対応）

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://hdhogsjmdowevijxooiq.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
if not SUPABASE_KEY:
    env_file = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("SUPABASE_SECRET_KEY="):
                SUPABASE_KEY = line.split("=", 1)[1].strip().strip('"')
                break
if not SUPABASE_KEY:
    print("ERROR: SUPABASE_SECRET_KEY が未設定", file=sys.stderr)
    sys.exit(1)

BUCKET       = "materials"
SUPABASE_BASE = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"
REPO_DIR     = Path(__file__).parent.parent
TMP_DIR      = REPO_DIR / "tmp_materials"
DATA_TS      = REPO_DIR / "src" / "lib" / "data.ts"
LOG_FILE     = Path(__file__).parent / "generate_chatgpt.log"
FAILED_LOG   = Path(__file__).parent / "failed_ids.txt"

CHROME_CMD = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--remote-debugging-port=9222",
    f'--user-data-dir={Path.home()}/.chatgpt-chrome-profile',
]

TMP_DIR.mkdir(exist_ok=True)

COMMON_CONDITIONS = (
    "共通条件\n"
    "背景は必ず純白 #FFFFFF\n"
    "線画スタイル\n"
    "輪郭線は太くはっきりと描き、細い線や掠れた線は使わない\n"
    "A4横長・高画質\n"
    "文字・テキスト・ラベル・枠線・フレームは一切入れない\n"
    "イラスト1点のみ・コマ割りや複数構成にしない"
)

ERROR_PHRASES = [
    "画像生成に失敗",
    "画像を作成できません",
    "もう一度リクエストしてください",
    "image generation failed",
    "couldn't generate",
    "unable to generate",
    "画像作成の制限に達しました",
    "制限に達しました",
]

# =============================================
# テーマ定義: 公園
# =============================================
PARK_ITEMS = {
    "swing": {
        "jp": "ブランコ",
        "note": "公園のブランコをシンプルでかわいく描く。チェーンと座面がはっきりわかる構図。支柱もしっかり描く。",
        "variants": {1: {"scenes": {"simple": "かわいい公園のブランコの塗り絵。ブランコ1台のみ・背景なし・余白たっぷり。","easy": "かわいい公園のブランコの塗り絵。子どもがブランコに乗っているかわいい構図。","normal": "かわいい公園のブランコの塗り絵。2人の子どもが並んでブランコをこいでいる構図。木が点在。","rich": "かわいい公園のブランコの塗り絵。子どもたちがブランコや周りで遊ぶにぎやかな公園の構図。木・花・ベンチが点在。"},"titles": {"simple": "こうえんのブランコ","easy": "ブランコにのろう","normal": "なかよしブランコ","rich": "にぎやかなブランコひろば"},"descs": {"simple": "シンプルな公園のブランコの線画。","easy": "ブランコに乗る子どもの線画。","normal": "2人で並ぶブランコの線画。木つき。","rich": "ブランコ広場のにぎやかな線画。木・花・ベンチつき。"}}},
    },
    "baby-swing": {
        "jp": "あかちゃんブランコ",
        "note": "赤ちゃん・幼児用のバケット型シートのブランコをかわいく描く。安全ベルトや囲いシートが特徴。",
        "variants": {1: {"scenes": {"simple": "かわいいあかちゃんブランコの塗り絵。バケット型シートのブランコ1台のみ・背景なし・余白たっぷり。","easy": "かわいいあかちゃんブランコの塗り絵。赤ちゃんがバケット型ブランコに乗っているかわいい構図。","normal": "かわいいあかちゃんブランコの塗り絵。お父さん（またはお母さん）が赤ちゃんをブランコに乗せて押している構図。","rich": "かわいいあかちゃんブランコの塗り絵。親子が公園で赤ちゃんブランコを楽しんでいるにぎやかな構図。木・花・他の遊具が点在。"},"titles": {"simple": "あかちゃんブランコ","easy": "ブランコにのるあかちゃん","normal": "おやこでブランコ","rich": "こうえんであかちゃんブランコ"},"descs": {"simple": "シンプルな赤ちゃん用バケット型ブランコの線画。","easy": "バケット型ブランコに乗る赤ちゃんの線画。","normal": "親が押す赤ちゃんブランコの線画。","rich": "公園で赤ちゃんブランコを楽しむ親子のにぎやかな線画。"}}},
    },
    "tire-swing": {
        "jp": "タイヤブランコ",
        "note": "大きなタイヤが横向きにチェーンで吊られたタイヤブランコをかわいく描く。タイヤの模様（溝）は輪郭線のみでシンプルに。",
        "variants": {1: {"scenes": {"simple": "かわいいタイヤブランコの塗り絵。タイヤブランコ1台のみ・背景なし・余白たっぷり。","easy": "かわいいタイヤブランコの塗り絵。子どもがタイヤの上に乗って揺れている構図。","normal": "かわいいタイヤブランコの塗り絵。2〜3人の子どもがタイヤブランコにまとまって乗っているにぎやかな構図。","rich": "かわいいタイヤブランコの塗り絵。子どもたちがタイヤブランコや周りで遊ぶ公園の構図。木・草・他の遊具が点在。"},"titles": {"simple": "タイヤブランコ","easy": "タイヤにのろう","normal": "みんなでタイヤブランコ","rich": "タイヤブランコのこうえん"},"descs": {"simple": "シンプルなタイヤブランコの線画。","easy": "タイヤブランコに乗る子どもの線画。","normal": "みんなで乗るタイヤブランコの線画。","rich": "タイヤブランコがある公園のにぎやかな線画。"}}},
    },
    "slide": {
        "jp": "すべり台",
        "note": "公園のすべり台をシンプルでかわいく描く。はしご・プラットフォーム・滑り面がはっきりわかる構図。",
        "variants": {1: {"scenes": {"simple": "かわいい公園のすべり台の塗り絵。すべり台1台のみ・背景なし・余白たっぷり。","easy": "かわいい公園のすべり台の塗り絵。子どもがすべり台を滑っているかわいい構図。","normal": "かわいい公園のすべり台の塗り絵。子どもたちが列を作ってすべり台で遊んでいる構図。","rich": "かわいい公園のすべり台の塗り絵。子どもたちがすべり台や周りで遊ぶにぎやかな公園の構図。木・花・他の遊具が点在。"},"titles": {"simple": "こうえんのすべり台","easy": "すべり台でしゅー","normal": "なかよしすべり台","rich": "にぎやかなすべり台"},"descs": {"simple": "シンプルな公園のすべり台の線画。","easy": "すべり台を滑る子どもの線画。","normal": "列を作って遊ぶすべり台の線画。","rich": "すべり台がある公園のにぎやかな線画。"}}},
    },
    "spiral-slide": {
        "jp": "らせんすべり台",
        "note": "螺旋状にぐるぐると回るらせんすべり台をかわいく描く。巻きつくような滑り面の形状がわかるように。",
        "variants": {1: {"scenes": {"simple": "かわいいらせんすべり台の塗り絵。らせんすべり台1台のみ・背景なし・余白たっぷり。","easy": "かわいいらせんすべり台の塗り絵。子どもがらせんすべり台を滑っているかわいい構図。","normal": "かわいいらせんすべり台の塗り絵。子どもたちがらせんすべり台で楽しんでいる構図。","rich": "かわいいらせんすべり台の塗り絵。大きならせんすべり台がある公園でにぎやかに遊ぶ子どもたちの構図。"},"titles": {"simple": "らせんすべり台","easy": "くるくるすべり台","normal": "たのしいらせんすべり台","rich": "らせんすべり台のこうえん"},"descs": {"simple": "シンプルならせんすべり台の線画。","easy": "らせんすべり台を滑る子どもの線画。","normal": "らせんすべり台で遊ぶ子どもたちの線画。","rich": "大きならせんすべり台がある公園のにぎやかな線画。"}}},
    },
    "tunnel-slide": {
        "jp": "トンネルすべり台",
        "note": "筒型のトンネルになったすべり台をかわいく描く。入口と出口の丸い開口部がわかるように。",
        "variants": {1: {"scenes": {"simple": "かわいいトンネルすべり台の塗り絵。トンネルすべり台1台のみ・背景なし・余白たっぷり。","easy": "かわいいトンネルすべり台の塗り絵。子どもがトンネルすべり台に入っているかわいい構図。","normal": "かわいいトンネルすべり台の塗り絵。子どもたちがトンネルすべり台で遊ぶ構図。入口に並ぶ子・出口から出る子。","rich": "かわいいトンネルすべり台の塗り絵。トンネルすべり台のある公園でにぎやかに遊ぶ子どもたちの構図。"},"titles": {"simple": "トンネルすべり台","easy": "トンネルくぐろう","normal": "たのしいトンネルすべり台","rich": "トンネルすべり台のこうえん"},"descs": {"simple": "シンプルなトンネルすべり台の線画。","easy": "トンネルすべり台で遊ぶ子どもの線画。","normal": "トンネルすべり台で遊ぶ子どもたちの線画。","rich": "トンネルすべり台がある公園のにぎやかな線画。"}}},
    },
    "seesaw": {
        "jp": "シーソー",
        "note": "公園のシーソーをシンプルでかわいく描く。支点・板・ハンドルがはっきりわかる構図。",
        "variants": {1: {"scenes": {"simple": "かわいい公園のシーソーの塗り絵。シーソー1台のみ・背景なし・余白たっぷり。","easy": "かわいい公園のシーソーの塗り絵。2人の子どもがシーソーに乗っているかわいい構図。","normal": "かわいい公園のシーソーの塗り絵。2組の子どもが並んだシーソーで楽しんでいる構図。","rich": "かわいい公園のシーソーの塗り絵。シーソーのある公園でにぎやかに遊ぶ子どもたちの構図。木・花が点在。"},"titles": {"simple": "こうえんのシーソー","easy": "シーソーでぎったんばっこ","normal": "なかよしシーソー","rich": "にぎやかなシーソーひろば"},"descs": {"simple": "シンプルな公園のシーソーの線画。","easy": "シーソーに乗る2人の子どもの線画。","normal": "2台並んだシーソーで遊ぶ子どもたちの線画。","rich": "シーソーがある公園のにぎやかな線画。"}}},
    },
    "sandbox": {
        "jp": "すなば",
        "note": "公園の砂場をシンプルでかわいく描く。枠・砂・バケツやスコップを含めてかわいく。",
        "variants": {1: {"scenes": {"simple": "かわいい公園の砂場の塗り絵。砂場とバケツ・スコップのみ・背景なし・余白たっぷり。","easy": "かわいい公園の砂場の塗り絵。子どもが砂場でお城を作っているかわいい構図。","normal": "かわいい公園の砂場の塗り絵。数人の子どもが砂場でいっしょに遊んでいる構図。","rich": "かわいい公園の砂場の塗り絵。砂場で遊ぶ子どもたちと周りの公園の風景のにぎやかな構図。"},"titles": {"simple": "こうえんのすなば","easy": "すなばでおしろ","normal": "なかよしすなば","rich": "にぎやかなすなばひろば"},"descs": {"simple": "シンプルな公園の砂場の線画。バケツとスコップつき。","easy": "砂場でお城を作る子どもの線画。","normal": "砂場でいっしょに遊ぶ子どもたちの線画。","rich": "砂場のある公園のにぎやかな線画。"}}},
    },
    "jungle-gym": {
        "jp": "ジャングルジム",
        "note": "格子状の鉄パイプで組まれたジャングルジムをシンプルでかわいく描く。立体的な格子構造がわかるように。",
        "variants": {1: {"scenes": {"simple": "かわいいジャングルジムの塗り絵。ジャングルジム1台のみ・背景なし・余白たっぷり。","easy": "かわいいジャングルジムの塗り絵。子どもがジャングルジムによじのぼっているかわいい構図。","normal": "かわいいジャングルジムの塗り絵。数人の子どもがジャングルジムで遊んでいる構図。","rich": "かわいいジャングルジムの塗り絵。ジャングルジムのある公園でにぎやかに遊ぶ子どもたちの構図。"},"titles": {"simple": "ジャングルジム","easy": "ジャングルジムにのぼろう","normal": "みんなでジャングルジム","rich": "ジャングルジムのこうえん"},"descs": {"simple": "シンプルなジャングルジムの線画。","easy": "ジャングルジムに登る子どもの線画。","normal": "みんなで遊ぶジャングルジムの線画。","rich": "ジャングルジムがある公園のにぎやかな線画。"}}},
    },
    "horizontal-bar": {
        "jp": "てつぼう",
        "note": "公園の鉄棒をシンプルでかわいく描く。支柱と横棒がはっきりわかる構図。高さの違う棒が複数あってもよい。",
        "variants": {1: {"scenes": {"simple": "かわいい公園の鉄棒の塗り絵。鉄棒のみ・背景なし・余白たっぷり。","easy": "かわいい公園の鉄棒の塗り絵。子どもが鉄棒にぶら下がっているかわいい構図。","normal": "かわいい公園の鉄棒の塗り絵。子どもが前回りをしている構図。応援する子もいる。","rich": "かわいい公園の鉄棒の塗り絵。鉄棒で遊ぶ子どもたちのにぎやかな公園の構図。"},"titles": {"simple": "こうえんのてつぼう","easy": "てつぼうにぶらさがろう","normal": "てつぼうでまえまわり","rich": "にぎやかなてつぼうひろば"},"descs": {"simple": "シンプルな公園の鉄棒の線画。","easy": "鉄棒にぶら下がる子どもの線画。","normal": "前回りをする子どもの鉄棒の線画。","rich": "鉄棒がある公園のにぎやかな線画。"}}},
    },
    "merry-go-round": {
        "jp": "メリーゴーラウンド",
        "note": "公園の回転する円形の遊具（回転ジャングルジムやターンテーブル型）をかわいく描く。円形の形状と手すりがわかるように。",
        "variants": {1: {"scenes": {"simple": "かわいいメリーゴーラウンドの塗り絵。回転遊具のみ・背景なし・余白たっぷり。","easy": "かわいいメリーゴーラウンドの塗り絵。子どもがメリーゴーラウンドに乗っているかわいい構図。","normal": "かわいいメリーゴーラウンドの塗り絵。数人の子どもがメリーゴーラウンドを回している構図。","rich": "かわいいメリーゴーラウンドの塗り絵。メリーゴーラウンドで楽しむ子どもたちの公園のにぎやかな構図。"},"titles": {"simple": "メリーゴーラウンド","easy": "くるくるメリーゴーラウンド","normal": "みんなでメリーゴーラウンド","rich": "メリーゴーラウンドのこうえん"},"descs": {"simple": "シンプルなメリーゴーラウンドの線画。","easy": "メリーゴーラウンドに乗る子どもの線画。","normal": "みんなで回すメリーゴーラウンドの線画。","rich": "メリーゴーラウンドがある公園のにぎやかな線画。"}}},
    },
    "spring-rider": {
        "jp": "スプリングライダー",
        "note": "ばね（スプリング）の上に動物や乗り物の形のシートがついた揺れる遊具をかわいく描く。動物（馬・クマ等）や乗り物の形がわかるように。",
        "variants": {1: {"scenes": {"simple": "かわいいスプリングライダーの塗り絵。馬の形のスプリングライダー1台のみ・背景なし・余白たっぷり。","easy": "かわいいスプリングライダーの塗り絵。子どもが馬の形のスプリングライダーに乗っているかわいい構図。","normal": "かわいいスプリングライダーの塗り絵。いろいろな形（馬・クマ・乗り物）のスプリングライダーが並んでいる構図。","rich": "かわいいスプリングライダーの塗り絵。スプリングライダーで遊ぶ子どもたちの公園のにぎやかな構図。"},"titles": {"simple": "スプリングライダー","easy": "スプリングライダーにのろう","normal": "いろんなスプリングライダー","rich": "スプリングライダーのこうえん"},"descs": {"simple": "シンプルなスプリングライダーの線画。","easy": "スプリングライダーに乗る子どもの線画。","normal": "いろいろな形のスプリングライダーの線画。","rich": "スプリングライダーがある公園のにぎやかな線画。"}}},
    },
    "balance-beam": {
        "jp": "平均台",
        "note": "公園の平均台をシンプルでかわいく描く。低くて幅の狭い板を渡る遊具。支柱と平らな台がわかるように。",
        "variants": {1: {"scenes": {"simple": "かわいい公園の平均台の塗り絵。平均台のみ・背景なし・余白たっぷり。","easy": "かわいい公園の平均台の塗り絵。子どもが平均台をバランスをとりながら渡っているかわいい構図。","normal": "かわいい公園の平均台の塗り絵。数人の子どもが並んで平均台を渡っている構図。","rich": "かわいい公園の平均台の塗り絵。平均台や他の遊具で遊ぶ子どもたちの公園のにぎやかな構図。"},"titles": {"simple": "こうえんの平均台","easy": "平均台をわたろう","normal": "みんなで平均台","rich": "平均台のあるこうえん"},"descs": {"simple": "シンプルな公園の平均台の線画。","easy": "平均台を渡る子どもの線画。","normal": "並んで平均台を渡る子どもたちの線画。","rich": "平均台がある公園のにぎやかな線画。"}}},
    },
    "climbing-wall": {
        "jp": "クライミングウォール",
        "note": "カラフルなホールドが付いた子ども向けクライミングウォールをシンプルな線画で描く。壁面のホールドは輪郭線のみでシンプルに。",
        "variants": {1: {"scenes": {"simple": "かわいいクライミングウォールの塗り絵。クライミングウォールのみ・背景なし・余白たっぷり。","easy": "かわいいクライミングウォールの塗り絵。子どもがクライミングウォールを登っているかわいい構図。","normal": "かわいいクライミングウォールの塗り絵。数人の子どもがクライミングウォールで遊んでいる構図。","rich": "かわいいクライミングウォールの塗り絵。クライミングウォールがある公園でにぎやかに遊ぶ子どもたちの構図。"},"titles": {"simple": "クライミングウォール","easy": "クライミングウォールをのぼろう","normal": "みんなでクライミング","rich": "クライミングウォールのこうえん"},"descs": {"simple": "シンプルなクライミングウォールの線画。","easy": "クライミングウォールを登る子どもの線画。","normal": "みんなで遊ぶクライミングウォールの線画。","rich": "クライミングウォールがある公園のにぎやかな線画。"}}},
    },
    "water-play": {
        "jp": "じゃぶじゃぶ池",
        "note": "浅い池や噴水広場で水遊びができる「じゃぶじゃぶ池」をかわいく描く。水・噴水・子どもが水をはねかける様子がわかるように。",
        "variants": {1: {"scenes": {"simple": "かわいいじゃぶじゃぶ池の塗り絵。じゃぶじゃぶ池の池と噴水のみ・背景なし・余白たっぷり。","easy": "かわいいじゃぶじゃぶ池の塗り絵。子どもがじゃぶじゃぶ池で水遊びをしているかわいい構図。","normal": "かわいいじゃぶじゃぶ池の塗り絵。数人の子どもがじゃぶじゃぶ池で楽しんでいる構図。噴水が出ている。","rich": "かわいいじゃぶじゃぶ池の塗り絵。じゃぶじゃぶ池で水遊びする子どもたちの夏の公園のにぎやかな構図。"},"titles": {"simple": "じゃぶじゃぶ池","easy": "みずあそびだ！","normal": "みんなでじゃぶじゃぶ","rich": "なつのじゃぶじゃぶ池"},"descs": {"simple": "シンプルなじゃぶじゃぶ池の線画。","easy": "じゃぶじゃぶ池で水遊びする子どもの線画。","normal": "噴水があるじゃぶじゃぶ池で遊ぶ子どもたちの線画。","rich": "夏のじゃぶじゃぶ池で遊ぶ子どもたちのにぎやかな線画。"}}},
    },
}

# =============================================
# テーマ定義: 恐竜
# （新しい恐竜を追加する場合はここに追記する）
# =============================================
DINOSAURS = {
    "tyrannosaurus": {
        "jp": "ティラノサウルス",
        "note": "ティラノサウルスの大きな頭と鋭い歯、小さな前足、太い後ろ足と長い尻尾をシンプルでかわいく描く。歯は鋭くしすぎず、子ども向けに親しみやすい表情にする。",
        "variants": {1: {"scenes": {"simple": "かわいいティラノサウルスの塗り絵。ティラノサウルス1匹のみ・横向きで立つ姿・背景なし・余白たっぷり。","easy": "かわいいティラノサウルスの塗り絵。ティラノサウルスが原始の森を歩いている構図。シダ植物の背景つき。","normal": "かわいいティラノサウルスの塗り絵。親子のティラノサウルスが森でくつろいでいる構図。木とシダが点在。","rich": "かわいいティラノサウルスの塗り絵。ティラノサウルスの家族が太古の森で過ごすにぎやかな構図。火山・木・シダ・小さな恐竜が点在。"},"titles": {"simple": "かわいいティラノサウルス","easy": "もりのティラノサウルス","normal": "ティラノサウルスのおやこ","rich": "ティラノサウルスのかぞく"},"descs": {"simple": "シンプルなティラノサウルスの線画。大きな頭と小さな前足がわかりやすい。","easy": "原始の森を歩くティラノサウルスの線画。シダ植物つき。","normal": "森でくつろぐ親子ティラノサウルスの線画。","rich": "太古の森で過ごすティラノサウルス家族のにぎやかな線画。火山と小さな恐竜つき。"}}},
    },
    "velociraptor": {
        "jp": "ヴェロキラプトル",
        "note": "ヴェロキラプトルの細身で素早い体つき、長い尻尾、後ろ足の鋭いカギ爪、小さな羽毛をシンプルでかわいく描く。鋭い顔は子ども向けに親しみやすくする。",
        "variants": {1: {"scenes": {"simple": "かわいいヴェロキラプトルの塗り絵。ヴェロキラプトル1匹のみ・横向きで立つ姿・背景なし・余白たっぷり。","easy": "かわいいヴェロキラプトルの塗り絵。ヴェロキラプトルが森の中を走っているかわいい構図。シダ植物つき。","normal": "かわいいヴェロキラプトルの塗り絵。2匹のヴェロキラプトルが群れで森を駆ける構図。木とシダが点在。","rich": "かわいいヴェロキラプトルの塗り絵。ヴェロキラプトルの群れが太古の森でにぎやかに過ごす構図。木・シダ・岩・卵が点在。"},"titles": {"simple": "かわいいヴェロキラプトル","easy": "もりのヴェロキラプトル","normal": "むれのヴェロキラプトル","rich": "ヴェロキラプトルのかぞく"},"descs": {"simple": "シンプルなヴェロキラプトルの線画。素早い体つきと長い尻尾がかわいい。","easy": "森を走るヴェロキラプトルの線画。シダ植物つき。","normal": "2匹で駆けるヴェロキラプトルの線画。木とシダつき。","rich": "太古の森で過ごすヴェロキラプトルの群れのにぎやかな線画。卵つき。"}}},
    },
    "spinosaurus": {
        "jp": "スピノサウルス",
        "note": "スピノサウルスの背中の大きな帆と細長いワニのような頭、長い尻尾をシンプルでかわいく描く。背中の帆は輪郭線のみで模様は入れない。",
        "variants": {1: {"scenes": {"simple": "かわいいスピノサウルスの塗り絵。スピノサウルス1匹のみ・横向きで立つ姿・背景なし・余白たっぷり。背中の大きな帆がよくわかる構図。","easy": "かわいいスピノサウルスの塗り絵。スピノサウルスが川辺で魚を探している構図。水と岸辺つき。","normal": "かわいいスピノサウルスの塗り絵。親子のスピノサウルスが水辺でくつろいでいる構図。川と植物が点在。","rich": "かわいいスピノサウルスの塗り絵。スピノサウルスの家族が古代の川辺で過ごすにぎやかな構図。川・魚・シダ・空が点在。"},"titles": {"simple": "かわいいスピノサウルス","easy": "かわのスピノサウルス","normal": "スピノサウルスのおやこ","rich": "スピノサウルスのかぞく"},"descs": {"simple": "シンプルなスピノサウルスの線画。背中の大きな帆が特徴。","easy": "川辺で魚を探すスピノサウルスの線画。水と岸辺つき。","normal": "水辺でくつろぐ親子スピノサウルスの線画。","rich": "古代の川辺で過ごすスピノサウルス家族のにぎやかな線画。魚つき。"}}},
    },
    # 新しい恐竜はここに追加 ↓
    # "triceratops": { "jp": "トリケラトプス", "note": "...", "variants": {1: {...}} },
}

THEMES = {
    "park":      PARK_ITEMS,
    "dinosaurs": DINOSAURS,
}

LEVEL_PARAMS = {
    "simple": (3, 5, 1, 10, "クレヨン"),
    "easy":   (3, 6, 2, 15, "クレヨン"),
    "normal": (4, 6, 3, 20, "色えんぴつ"),
    "rich":   (4, 6, 4, 30, "色えんぴつ"),
}

# =============================================
# ユーティリティ
# =============================================
def log(msg):
    ts = time.strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def supabase_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_to_supabase(client, local_path, remote_name):
    with open(local_path, "rb") as f:
        data = f.read()
    client.storage.from_(BUCKET).upload(
        path=remote_name,
        file=data,
        file_options={"content-type": "image/png", "upsert": "true"},
    )
    return f"{SUPABASE_BASE}/{remote_name}"


def add_to_data_ts(item_id, theme_type, variant, vdata, supabase_urls):
    levels = ["simple", "easy", "normal", "rich"]
    first_id = f"{item_id}-simple-{variant}"
    content = DATA_TS.read_text()
    if f"id: '{first_id}'" in content:
        log(f"  data.ts に既存: {first_id} — スキップ")
        return False

    tag_label = "こうえん" if theme_type == "park" else "きょうりゅう"
    activity_ideas = (
        "['好きな色で塗ってみよう', '公園で遊んだことを思い出しながら塗ろう']"
        if theme_type == "park"
        else "['好きな色で塗ってみよう', '背景もカラフルに仕上げよう']"
    )

    block = ""
    for lv in levels:
        file_id = f"{item_id}-{lv}-{variant}"
        if file_id not in supabase_urls:
            continue
        url = supabase_urls[file_id]
        title = vdata["titles"][lv]
        desc  = vdata["descs"][lv]
        age_min, age_max, diff, dur, tools = LEVEL_PARAMS[lv]
        block += f"""  {{
    id: '{file_id}',
    title: '{title}',
    description: '{desc}',
    ageMin: {age_min}, ageMax: {age_max}, difficulty: {diff}, duration: {dur},
    category: 'coloring', theme: '{theme_type}',
    tags: ['{item_id}', '{tag_label}', 'ぬりえ'],
    tools: ['{tools}'],
    activityIdeas: {activity_ideas},
    imageUrl: '{url}',
    illustUrl: '{url}',
    illustVersion: 1,
    imageStatus: 'pending_review',
    pdfUrl: '',
    createdAt: '{time.strftime('%Y-%m-%dT%H:%M')}',
    popular: false,
  }},
"""
    insert_pos = content.rfind('},', 0, content.find(']\n\nexport type SortKey')) + 2
    new_content = content[:insert_pos] + '\n' + block.rstrip(',\n') + ',' + content[insert_pos:]
    DATA_TS.write_text(new_content)
    log("  data.ts 更新完了")
    return True


def git_commit_push(item_id, theme_type, variant):
    subprocess.run(["git", "add", "src/lib/data.ts"], cwd=REPO_DIR, check=True)
    msg = f"Add {theme_type}/{item_id}-{variant} coloring pages"
    subprocess.run(["git", "commit", "-m", msg], cwd=REPO_DIR, check=True)
    subprocess.run(["git", "pull", "--rebase", "origin", "main"], cwd=REPO_DIR, check=False)
    subprocess.run(["git", "push", "origin", "main"], cwd=REPO_DIR, check=True)
    log(f"  push 完了: {item_id}-{variant}")


# =============================================
# ChatGPT ブラウザ操作エンジン
# =============================================
def wait_for_image(page, timeout=240):
    deadline = time.time() + timeout
    while time.time() < deadline:
        imgs = page.query_selector_all("img")
        for img in imgs:
            src = img.get_attribute("src") or ""
            if "backend-api/estuary/content" in src or "oaiusercontent" in src:
                return ('ok', src)
        try:
            body_text = page.evaluate("() => document.body.innerText")
            for phrase in ERROR_PHRASES:
                if phrase in body_text:
                    return ('error', None)
        except Exception:
            pass
        time.sleep(3)
    return ('timeout', None)


def whiten_background(in_path, out_path=None, threshold=235):
    try:
        from PIL import Image
        import numpy as np
        out_path = out_path or in_path
        img = Image.open(in_path).convert("RGB")
        arr = np.array(img)
        mask = (arr[:,:,0] >= threshold) & (arr[:,:,1] >= threshold) & (arr[:,:,2] >= threshold)
        arr[mask] = [255, 255, 255]
        Image.fromarray(arr).save(out_path, "PNG", optimize=True)
        return True
    except Exception as e:
        log(f"  背景純白化失敗: {e}")
        return False


def download_image(page, img_src, out_path):
    data = page.evaluate("""async (url) => {
        const r = await fetch(url, {credentials: 'include'});
        const buf = await r.arrayBuffer();
        return Array.from(new Uint8Array(buf));
    }""", img_src)
    if data:
        with open(out_path, "wb") as f:
            f.write(bytes(data))
        whiten_background(out_path)
        return True
    return False


def delete_current_chat(page):
    try:
        url = page.url
        m = re.search(r"/c/([0-9a-f-]+)", url)
        if not m:
            return False
        conv_id = m.group(1)
        result = page.evaluate("""async (id) => {
            const r = await fetch(`/backend-api/conversation/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({is_visible: false}),
            });
            return r.ok;
        }""", conv_id)
        return bool(result)
    except Exception:
        return False


def generate_one(page, file_id, prompt, out_path, max_retries=3):
    if out_path.exists():
        log(f"  スキップ（既存）: {file_id}")
        return True

    for attempt in range(1, max_retries + 1):
        log(f"  生成開始 (試行 {attempt}/{max_retries}): {file_id}")
        page.goto("https://chatgpt.com/", wait_until="domcontentloaded")
        time.sleep(2)
        try:
            box = page.wait_for_selector("#prompt-textarea", timeout=30000)
        except Exception as e:
            log(f"  入力欄取得失敗: {e}")
            time.sleep(5)
            continue
        box.click()
        box.fill(prompt)
        time.sleep(0.5)
        page.keyboard.press("Enter")
        log("  プロンプト送信。生成待ち...")

        status, img_src = wait_for_image(page, timeout=240)
        if status == 'ok':
            ok = download_image(page, img_src, out_path)
            if ok:
                log(f"  ローカル保存: {out_path}")
                delete_current_chat(page)
                # レート制限対策: 生成完了後に待機
                log(f"  レート制限待機: {INTER_REQUEST_SLEEP}秒")
                time.sleep(INTER_REQUEST_SLEEP)
                return True
            log("  DL失敗、リトライ")
        elif status == 'error':
            log("  ChatGPTエラー検知、リトライ")
            delete_current_chat(page)
        else:
            log("  タイムアウト、リトライ")
        time.sleep(5)

    log(f"  最大リトライ到達、失敗: {file_id}")
    return False


def notify_mac(title, msg):
    try:
        subprocess.run(["osascript", "-e", f'display notification "{msg}" with title "{title}"'], check=False)
    except Exception:
        pass


def restart_chrome(pw):
    log("  [復旧] Chromeを再起動中...")
    subprocess.run(["pkill", "-f", "remote-debugging-port=9222"], check=False)
    time.sleep(3)
    subprocess.Popen(CHROME_CMD, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(8)
    for attempt in range(3):
        try:
            browser = pw.chromium.connect_over_cdp("http://localhost:9222")
            log("  [復旧] Chrome再接続成功")
            return browser
        except Exception as e:
            log(f"  [復旧] 再接続失敗 ({attempt+1}/3): {e}")
            time.sleep(5)
    log("  [復旧] Chrome再接続できず")
    return None


def generate_with_recovery(pw, state, file_id, prompt, out_path):
    if generate_one(state['page'], file_id, prompt, out_path):
        return True

    log(f"  [復旧①] 60秒クールダウン後に再試行: {file_id}")
    time.sleep(60)
    if generate_one(state['page'], file_id, prompt, out_path, max_retries=1):
        return True

    log(f"  [復旧②] ブラウザ再起動後に再試行: {file_id}")
    new_browser = restart_chrome(pw)
    if new_browser is not None:
        state['browser'] = new_browser
        state['page'] = new_browser.contexts[0].new_page()
        if generate_one(state['page'], file_id, prompt, out_path, max_retries=1):
            return True

    log(f"  [復旧③] スキップして次へ: {file_id}")
    with open(FAILED_LOG, "a") as f:
        f.write(f"{time.strftime('%Y-%m-%dT%H:%M:%S')} {file_id}\n")
    notify_mac("ぬりえ生成失敗", f"{file_id} をスキップしました")
    return False


# =============================================
# テーマ実行
# =============================================
def run_item(pw, state, item_id, theme_type, variant, client):
    items = THEMES[theme_type]
    item  = items[item_id]
    vdata = item["variants"][variant]
    log(f"\n{'='*50}\n[{theme_type}] {item_id}-{variant} ({item['jp']})")

    levels = ["simple", "easy", "normal", "rich"]
    supabase_urls = {}

    for lv in levels:
        file_id   = f"{item_id}-{lv}-{variant}"
        scene     = vdata["scenes"][lv]
        prompt    = f"{scene}\n{item['note']}\n{COMMON_CONDITIONS}"
        local_path = TMP_DIR / f"{file_id}-illust.png"

        ok = generate_with_recovery(pw, state, file_id, prompt, local_path)
        if not ok:
            continue
        try:
            url = upload_to_supabase(client, local_path, f"{file_id}-illust.png")
            supabase_urls[file_id] = url
            log(f"  Supabase: {url}")
        except Exception as e:
            log(f"  Supabase失敗: {file_id} — {e}")

    if supabase_urls:
        if add_to_data_ts(item_id, theme_type, variant, vdata, supabase_urls):
            git_commit_push(item_id, theme_type, variant)
    log(f"完了: {item_id}-{variant} ({len(supabase_urls)}/4枚)")
    return len(supabase_urls)


# =============================================
# メイン
# =============================================
def main():
    parser = argparse.ArgumentParser(description="ChatGPT画像生成スクリプト（公園・恐竜共通）")
    parser.add_argument("--type",    required=True, choices=["park", "dinosaurs"], help="テーマ種別")
    parser.add_argument("--item",    default=None,  help="アイテムID（例: swing, tyrannosaurus）")
    parser.add_argument("--variant", type=int, default=1, help="バリエーション番号（デフォルト: 1）")
    parser.add_argument("--all",     action="store_true", help="全アイテムを生成")
    args = parser.parse_args()

    items = THEMES[args.type]

    if not args.all and args.item not in items:
        log(f"ERROR: '{args.item}' の定義がありません。利用可能: {list(items.keys())}")
        sys.exit(1)

    client = supabase_client()

    with sync_playwright() as pw:
        try:
            browser = pw.chromium.connect_over_cdp("http://localhost:9222")
        except Exception:
            log("ERROR: Chrome CDP接続失敗。以下で起動してください:")
            log(r'  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.chatgpt-chrome-profile"')
            sys.exit(1)

        state = {'browser': browser, 'page': browser.contexts[0].new_page()}

        if args.all:
            for iid, item in items.items():
                for v in item["variants"]:
                    run_item(pw, state, iid, args.type, v, client)
                    time.sleep(10)
        else:
            run_item(pw, state, args.item, args.type, args.variant, client)

        state['browser'].close()
        log("\n全処理完了")


if __name__ == "__main__":
    main()
