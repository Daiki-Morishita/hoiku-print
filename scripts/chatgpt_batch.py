#!/usr/bin/env python3
"""
ChatGPT ブラウザ自動化による夜間画像バッチ生成スクリプト
事前に chatgpt_auth.py でログイン状態を保存しておくこと

使い方:
  python3 scripts/chatgpt_batch.py [--theme {theme_id}] [--headless]
  python3 scripts/chatgpt_batch.py --all  # 全未完了テーマを一括処理
"""

import os, sys, time, json, subprocess, argparse, requests
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PwTimeout

AUTH_STATE   = os.path.join(os.path.dirname(__file__), "auth_state.json")
MATERIALS_DIR = os.path.join(os.path.dirname(__file__), "../public/materials")
DATA_TS_PATH  = os.path.join(os.path.dirname(__file__), "../src/lib/data.ts")
REPO_DIR      = os.path.join(os.path.dirname(__file__), "..")
LOG_FILE      = os.path.join(os.path.dirname(__file__), "chatgpt_batch.log")

COMMON_CONDITIONS = """
共通条件
白背景・線画スタイル（塗りつぶしなし）
輪郭線は太くはっきりと描き、細い線や掠れた線は使わない
A4横長・高画質
文字・テキスト・ラベル・枠線・フレームは一切入れない
イラスト1点のみ・コマ割りや複数構成にしない
""".strip()

# =========================================================
# テーマ定義（未完了の動物テーマ）
# =========================================================
THEMES = [
    {
        "id": "crane",
        "title_jp": "ツル",
        "specs": [
            ("crane-simple-1", "かわいいツルの塗り絵。ツル1羽のみ・立ち姿・背景なし・余白たっぷり。"),
            ("crane-easy-1",   "かわいいツルの塗り絵。ツルが田んぼや湿地でのんびり歩いている構図。"),
            ("crane-normal-1", "かわいいツルの塗り絵。2羽のツルが向かい合って踊るような構図。"),
            ("crane-rich-1",   "かわいいツルの塗り絵。ツルの家族が広い田んぼで過ごすにぎやかな構図。山・空・草が点在。"),
        ],
        "common_note": "ツルの長い首と足をシンプルでかわいく描く。頭の赤い部分は輪郭線のみで表現。",
        "entries": [
            ("crane-simple-1", "かわいいツル", "シンプルなツルの線画。長い首と足がわかりやすい。", 2, 3, 1, 10, "クレヨン"),
            ("crane-easy-1",   "たんぼのツル", "田んぼを歩くツルの線画。草の背景つき。", 3, 4, 2, 15, "クレヨン"),
            ("crane-normal-1", "おどるツル", "2羽のツルが向かい合う線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("crane-rich-1",   "ツルのかぞく", "ツル家族が田んぼで過ごすにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "pelican",
        "title_jp": "ペリカン",
        "specs": [
            ("pelican-simple-1", "かわいいペリカンの塗り絵。ペリカン1羽のみ・横向き・背景なし・余白たっぷり。"),
            ("pelican-easy-1",   "かわいいペリカンの塗り絵。ペリカンが海岸の岩の上に立っている構図。海と空つき。"),
            ("pelican-normal-1", "かわいいペリカンの塗り絵。ペリカンが海に飛び込んで魚を獲っている構図。"),
            ("pelican-rich-1",   "かわいいペリカンの塗り絵。ペリカンの家族が海辺で過ごすにぎやかな構図。海・岩・魚・空が点在。"),
        ],
        "common_note": "ペリカンの大きなくちばし（喉袋）をシンプルでかわいく描く。",
        "entries": [
            ("pelican-simple-1", "かわいいペリカン", "シンプルなペリカンの線画。大きなくちばしがわかりやすい。", 2, 3, 1, 10, "クレヨン"),
            ("pelican-easy-1",   "うみべのペリカン", "海岸の岩の上に立つペリカンの線画。海と空つき。", 3, 4, 2, 15, "クレヨン"),
            ("pelican-normal-1", "さかなをとるペリカン", "海に飛び込むペリカンの線画。魚つき。", 3, 5, 3, 20, "色えんぴつ"),
            ("pelican-rich-1",   "ペリカンのかぞく", "ペリカン家族が海辺で過ごすにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "cheetah",
        "title_jp": "チーター",
        "specs": [
            ("cheetah-simple-1", "かわいいチーターの塗り絵。チーター1匹のみ・横向き・背景なし・余白たっぷり。"),
            ("cheetah-easy-1",   "かわいいチーターの塗り絵。チーターの子どもがサバンナに座っているかわいい構図。"),
            ("cheetah-normal-1", "かわいいチーターの塗り絵。母チーターと子どもが草原でくつろいでいる親子の構図。"),
            ("cheetah-rich-1",   "かわいいチーターの塗り絵。チーター家族がアフリカのサバンナで過ごすにぎやかな構図。アカシア・草・太陽が点在。"),
        ],
        "common_note": "チーターの斑点模様は黒く塗りつぶさず輪郭線のみで表現し、子どもが自由に塗れる形にする。",
        "entries": [
            ("cheetah-simple-1", "かわいいチーター", "シンプルなチーターの線画。斑点の輪郭がわかりやすい。", 2, 3, 1, 10, "クレヨン"),
            ("cheetah-easy-1",   "サバンナのチーター", "サバンナに座るチーターの子どもの線画。", 3, 4, 2, 15, "クレヨン"),
            ("cheetah-normal-1", "チーターのおやこ", "草原でくつろぐ母子チーターの線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("cheetah-rich-1",   "チーターのかぞく", "サバンナで過ごすチーター家族のにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "alpaca",
        "title_jp": "アルパカ",
        "specs": [
            ("alpaca-simple-1", "かわいいアルパカの塗り絵。アルパカ1匹のみ・正面向き・背景なし・余白たっぷり。"),
            ("alpaca-easy-1",   "かわいいアルパカの塗り絵。アルパカの子どもが草を食べているかわいい構図。"),
            ("alpaca-normal-1", "かわいいアルパカの塗り絵。アルパカの親子がアンデスの丘でのんびりしている構図。"),
            ("alpaca-rich-1",   "かわいいアルパカの塗り絵。アルパカの群れが山の牧場で過ごすにぎやかな構図。山・草・花・空が点在。"),
        ],
        "common_note": "アルパカのふわふわした毛はシンプルな丸みのある輪郭線で表現し、子どもが塗りやすい形にする。",
        "entries": [
            ("alpaca-simple-1", "かわいいアルパカ", "シンプルなアルパカの線画。ふわふわの毛がわかりやすい。", 2, 3, 1, 10, "クレヨン"),
            ("alpaca-easy-1",   "くさをたべるアルパカ", "草を食べるアルパカの子どもの線画。", 3, 4, 2, 15, "クレヨン"),
            ("alpaca-normal-1", "アルパカのおやこ", "丘でのんびりする親子アルパカの線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("alpaca-rich-1",   "アルパカのむれ", "牧場で過ごすアルパカの群れのにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "capybara",
        "title_jp": "カピバラ",
        "specs": [
            ("capybara-simple-1", "かわいいカピバラの塗り絵。カピバラ1匹のみ・横向き・背景なし・余白たっぷり。"),
            ("capybara-easy-1",   "かわいいカピバラの塗り絵。カピバラが川べりでのんびりしている構図。草と水辺つき。"),
            ("capybara-normal-1", "かわいいカピバラの塗り絵。カピバラの親子が川で水浴びしている構図。"),
            ("capybara-rich-1",   "かわいいカピバラの塗り絵。カピバラの家族が川辺で過ごすにぎやかな構図。川・草・木・花が点在。"),
        ],
        "common_note": "カピバラのずんぐりした体とぽわっとした顔をシンプルでかわいく描く。",
        "entries": [
            ("capybara-simple-1", "かわいいカピバラ", "シンプルなカピバラの線画。丸みのある体がわかりやすい。", 2, 3, 1, 10, "クレヨン"),
            ("capybara-easy-1",   "かわべのカピバラ", "川べりでのんびりするカピバラの線画。草と水辺つき。", 3, 4, 2, 15, "クレヨン"),
            ("capybara-normal-1", "カピバラのおやこ", "川で水浴びする親子カピバラの線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("capybara-rich-1",   "カピバラのかぞく", "川辺で過ごすカピバラ家族のにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "fennec",
        "title_jp": "フェネック",
        "specs": [
            ("fennec-simple-1", "かわいいフェネックの塗り絵。フェネック1匹のみ・正面向き・背景なし・余白たっぷり。"),
            ("fennec-easy-1",   "かわいいフェネックの塗り絵。フェネックの子どもが砂漠の砂の上に座っているかわいい構図。"),
            ("fennec-normal-1", "かわいいフェネックの塗り絵。親子フェネックが砂漠のオアシスでくつろいでいる構図。"),
            ("fennec-rich-1",   "かわいいフェネックの塗り絵。フェネック家族が砂漠で過ごすにぎやかな構図。砂丘・星空・ヤシの木が点在。"),
        ],
        "common_note": "フェネックの大きな耳をシンプルでかわいく強調して描く。",
        "entries": [
            ("fennec-simple-1", "かわいいフェネック", "シンプルなフェネックの線画。大きな耳がかわいい。", 2, 3, 1, 10, "クレヨン"),
            ("fennec-easy-1",   "さばくのフェネック", "砂漠に座るフェネックの子どもの線画。", 3, 4, 2, 15, "クレヨン"),
            ("fennec-normal-1", "フェネックのおやこ", "オアシスでくつろぐ親子フェネックの線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("fennec-rich-1",   "フェネックのかぞく", "砂漠で過ごすフェネック家族のにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "meerkat",
        "title_jp": "ミーアキャット",
        "specs": [
            ("meerkat-simple-1", "かわいいミーアキャットの塗り絵。ミーアキャット1匹のみ・立ち姿・背景なし・余白たっぷり。"),
            ("meerkat-easy-1",   "かわいいミーアキャットの塗り絵。ミーアキャットが岩の上に立ってきょろきょろしているかわいい構図。"),
            ("meerkat-normal-1", "かわいいミーアキャットの塗り絵。ミーアキャットの家族が巣穴の前に並んでいる構図。"),
            ("meerkat-rich-1",   "かわいいミーアキャットの塗り絵。ミーアキャットの群れが砂漠で見張りをするにぎやかな構図。岩・砂・太陽が点在。"),
        ],
        "common_note": "ミーアキャットの直立した姿勢と小さな手をシンプルでかわいく描く。",
        "entries": [
            ("meerkat-simple-1", "かわいいミーアキャット", "シンプルなミーアキャットの線画。直立した姿がかわいい。", 2, 3, 1, 10, "クレヨン"),
            ("meerkat-easy-1",   "みはりのミーアキャット", "岩の上に立つミーアキャットの線画。", 3, 4, 2, 15, "クレヨン"),
            ("meerkat-normal-1", "ミーアキャットのかぞく", "巣穴の前に並ぶミーアキャット家族の線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("meerkat-rich-1",   "ミーアキャットのむれ", "砂漠で見張りするミーアキャットの群れのにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "chameleon",
        "title_jp": "カメレオン",
        "specs": [
            ("chameleon-simple-1", "かわいいカメレオンの塗り絵。カメレオン1匹のみ・横向き・背景なし・余白たっぷり。"),
            ("chameleon-easy-1",   "かわいいカメレオンの塗り絵。カメレオンが木の枝にしがみついているかわいい構図。葉っぱつき。"),
            ("chameleon-normal-1", "かわいいカメレオンの塗り絵。親子カメレオンが木の上でのんびりしている構図。"),
            ("chameleon-rich-1",   "かわいいカメレオンの塗り絵。カメレオン家族が熱帯の木々の中で過ごすにぎやかな構図。木・葉・花・太陽が点在。"),
        ],
        "common_note": "カメレオンのうろこ模様はシンプルな格子状の輪郭線のみで表現し、子どもが自由に塗れる形にする。くるりと巻いた尻尾もかわいく描く。",
        "entries": [
            ("chameleon-simple-1", "かわいいカメレオン", "シンプルなカメレオンの線画。うろこと巻き尾がかわいい。", 2, 3, 1, 10, "クレヨン"),
            ("chameleon-easy-1",   "えだにつかまるカメレオン", "木の枝にしがみつくカメレオンの線画。葉っぱつき。", 3, 4, 2, 15, "クレヨン"),
            ("chameleon-normal-1", "カメレオンのおやこ", "木の上でのんびりする親子カメレオンの線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("chameleon-rich-1",   "カメレオンのかぞく", "熱帯の木々で過ごすカメレオン家族のにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "chicken",
        "title_jp": "ニワトリ",
        "specs": [
            ("chicken-simple-1", "かわいいニワトリの塗り絵。ニワトリ1羽のみ・横向き・背景なし・余白たっぷり。"),
            ("chicken-easy-1",   "かわいいニワトリの塗り絵。ニワトリがひよこと一緒に農場を歩いているかわいい構図。"),
            ("chicken-normal-1", "かわいいニワトリの塗り絵。母ニワトリとひよこたちが農場でのんびりしている構図。"),
            ("chicken-rich-1",   "かわいいニワトリの塗り絵。ニワトリ・ひよこ・卵がにぎやかな農場で暮らす構図。小屋・草・花・太陽が点在。"),
        ],
        "common_note": "ニワトリのとさかと羽をシンプルでかわいく描く。ひよこも丸くてかわいい形にする。",
        "entries": [
            ("chicken-simple-1", "かわいいニワトリ", "シンプルなニワトリの線画。とさかと羽がわかりやすい。", 2, 3, 1, 10, "クレヨン"),
            ("chicken-easy-1",   "ひよこといっしょ", "ひよこと歩くニワトリの線画。農場つき。", 3, 4, 2, 15, "クレヨン"),
            ("chicken-normal-1", "ニワトリのかぞく", "農場でのんびりする母ニワトリとひよこの線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("chicken-rich-1",   "にぎやかなのうじょう", "ニワトリ・ひよこ・卵が農場ではたらくにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "polar-bear",
        "title_jp": "シロクマ",
        "specs": [
            ("polar-bear-simple-1", "かわいいシロクマの塗り絵。シロクマ1匹のみ・正面向き・背景なし・余白たっぷり。"),
            ("polar-bear-easy-1",   "かわいいシロクマの塗り絵。シロクマの子どもが雪の上に座っているかわいい構図。雪と空つき。"),
            ("polar-bear-normal-1", "かわいいシロクマの塗り絵。母シロクマと子どもが氷の上で遊んでいる親子の構図。"),
            ("polar-bear-rich-1",   "かわいいシロクマの塗り絵。シロクマ家族が北極で過ごすにぎやかな構図。氷・雪・オーロラ・星が点在。"),
        ],
        "common_note": "シロクマの丸みのある体と愛らしい顔をシンプルでかわいく描く。毛並みは輪郭線のみ。",
        "entries": [
            ("polar-bear-simple-1", "かわいいシロクマ", "シンプルなシロクマの線画。丸みのある体がかわいい。", 2, 3, 1, 10, "クレヨン"),
            ("polar-bear-easy-1",   "ゆきのシロクマ", "雪の上に座るシロクマの子どもの線画。", 3, 4, 2, 15, "クレヨン"),
            ("polar-bear-normal-1", "シロクマのおやこ", "氷の上で遊ぶ親子シロクマの線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("polar-bear-rich-1",   "シロクマのかぞく", "北極で過ごすシロクマ家族のにぎやかな線画。オーロラつき。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "butterfly",
        "title_jp": "チョウ",
        "specs": [
            ("butterfly-simple-1", "かわいいチョウの塗り絵。チョウ1匹のみ・羽を広げた姿・背景なし・余白たっぷり。"),
            ("butterfly-easy-1",   "かわいいチョウの塗り絵。チョウが花の上にとまってミツを吸っているかわいい構図。"),
            ("butterfly-normal-1", "かわいいチョウの塗り絵。2〜3匹のチョウが花畑を飛んでいる構図。"),
            ("butterfly-rich-1",   "かわいいチョウの塗り絵。たくさんのチョウとお花と草が広がるにぎやかな春の野原の構図。"),
        ],
        "common_note": "チョウの羽の模様は輪郭線のみで表現し、黒く塗りつぶさず子どもが自由に色を塗れる形にする。",
        "entries": [
            ("butterfly-simple-1", "かわいいチョウ", "シンプルなチョウの線画。大きな羽がわかりやすい。", 2, 3, 1, 10, "クレヨン"),
            ("butterfly-easy-1",   "はなのうえのチョウ", "花にとまるチョウの線画。", 3, 4, 2, 15, "クレヨン"),
            ("butterfly-normal-1", "はなばたけのチョウ", "花畑を飛ぶ複数のチョウの線画。", 3, 5, 3, 20, "色えんぴつ"),
            ("butterfly-rich-1",   "はるののはら", "チョウと花が広がる春の野原のにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
    {
        "id": "ladybug",
        "title_jp": "テントウムシ",
        "specs": [
            ("ladybug-simple-1", "かわいいテントウムシの塗り絵。テントウムシ1匹のみ・真上から見た姿・背景なし・余白たっぷり。"),
            ("ladybug-easy-1",   "かわいいテントウムシの塗り絵。テントウムシが葉っぱの上を歩いているかわいい構図。"),
            ("ladybug-normal-1", "かわいいテントウムシの塗り絵。テントウムシが花の茎をのぼっている構図。花と葉つき。"),
            ("ladybug-rich-1",   "かわいいテントウムシの塗り絵。テントウムシ・チョウ・バッタが花畑でにぎやかに過ごす構図。"),
        ],
        "common_note": "テントウムシの水玉模様は輪郭線のみで表現し、黒く塗りつぶさず子どもが塗れる形にする。",
        "entries": [
            ("ladybug-simple-1", "かわいいテントウムシ", "シンプルなテントウムシの線画。丸い体と水玉がかわいい。", 2, 3, 1, 10, "クレヨン"),
            ("ladybug-easy-1",   "はっぱのうえのテントウムシ", "葉の上を歩くテントウムシの線画。", 3, 4, 2, 15, "クレヨン"),
            ("ladybug-normal-1", "はなをのぼるテントウムシ", "花の茎をのぼるテントウムシの線画。花と葉つき。", 3, 5, 3, 20, "色えんぴつ"),
            ("ladybug-rich-1",   "はなばたけのむし", "テントウムシ・チョウ・バッタが花畑で過ごすにぎやかな線画。", 4, 6, 4, 30, "色えんぴつ"),
        ],
    },
]

# =========================================================
# ユーティリティ
# =========================================================
def log(msg):
    ts = time.strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def skip_check(file_id):
    """既に画像ファイルが存在すればスキップ"""
    return os.path.exists(os.path.join(MATERIALS_DIR, f"{file_id}-illust.png"))


def add_to_data_ts(theme_id, entries):
    with open(DATA_TS_PATH, 'r') as f:
        content = f.read()
    # 既に登録済みならスキップ
    if f"id: '{entries[0][0]}'" in content:
        log(f"  data.ts に既存: {entries[0][0]} — スキップ")
        return
    block = ""
    for file_id, title, desc, age_min, age_max, diff, dur, tools in entries:
        block += f"""  {{
    id: '{file_id}',
    title: '{title}',
    description: '{desc}',
    ageMin: {age_min}, ageMax: {age_max}, difficulty: {diff}, duration: {dur},
    category: 'coloring', theme: 'animals',
    tags: ['{theme_id}', 'どうぶつ', 'ぬりえ'],
    tools: ['{tools.split("・")[0]}'],
    activityIdeas: [
      '好きな色で塗ってみよう',
      '背景もカラフルに仕上げよう',
    ],
    imageUrl: '/materials/{file_id}-illust.png',
    illustUrl: '/materials/{file_id}-illust.png',
    illustVersion: 1,
    imageStatus: 'pending_review',
    pdfUrl: '',
    createdAt: '2026-05-12',
    popular: false,
  }},\n"""
    insert_pos = content.rfind('},', 0, content.find(']\n\nexport type SortKey')) + 2
    new_content = content[:insert_pos] + '\n' + block.rstrip(',\n') + ',' + content[insert_pos:]
    with open(DATA_TS_PATH, 'w') as f:
        f.write(new_content)
    log(f"  data.ts 更新完了: {theme_id}")


def git_commit_push(theme_id, file_ids):
    patterns = [f"public/materials/{fid}-illust.png" for fid in file_ids]
    subprocess.run(["git", "add"] + patterns + ["src/lib/data.ts"], cwd=REPO_DIR, check=True)
    subprocess.run(["git", "commit", "-m", f"Add {theme_id} theme via ChatGPT browser"], cwd=REPO_DIR, check=True)
    subprocess.run(["git", "push", "origin", "main"], cwd=REPO_DIR, check=True)
    log(f"  push 完了: {theme_id}")


# =========================================================
# ChatGPT 操作
# =========================================================
def wait_for_image(page, timeout=180):
    """画像生成完了を待つ。生成済み画像のsrcを返す"""
    deadline = time.time() + timeout
    while time.time() < deadline:
        imgs = page.query_selector_all("img")
        for img in imgs:
            src = img.get_attribute("src") or ""
            # ChatGPT画像は backend-api/estuary/content または oaiusercontent
            if "backend-api/estuary/content" in src or "oaiusercontent" in src:
                return src
        time.sleep(3)
    return None


def download_image(page, img_src, out_path):
    """Playwrightのコンテキストを使って画像をダウンロード（認証付き）"""
    data = page.evaluate("""async (url) => {
        const r = await fetch(url, {credentials: 'include'});
        const buf = await r.arrayBuffer();
        return Array.from(new Uint8Array(buf));
    }""", img_src)
    if data:
        with open(out_path, "wb") as f:
            f.write(bytes(data))
        return True
    log(f"  画像DL失敗: データなし")
    return False


def generate_one(page, file_id, prompt, out_path):
    """1枚生成して保存。成功したらTrueを返す"""
    if skip_check(file_id):
        log(f"  スキップ（既存）: {file_id}")
        return True

    log(f"  生成開始: {file_id}")

    # 新しいチャットを開く
    page.goto("https://chatgpt.com/", wait_until="domcontentloaded")
    time.sleep(2)

    # プロンプト入力欄
    box = page.wait_for_selector("#prompt-textarea", timeout=30000)
    box.click()
    box.fill(prompt)
    time.sleep(0.5)
    page.keyboard.press("Enter")

    log(f"  プロンプト送信完了。生成待ち...")

    img_src = wait_for_image(page, timeout=180)
    if not img_src:
        log(f"  タイムアウト: {file_id}")
        return False

    ok = download_image(page, img_src, out_path)
    if ok:
        log(f"  保存完了: {out_path}")
    return ok


def run_theme(page, theme):
    tid = theme["id"]
    log(f"\n{'='*50}")
    log(f"テーマ開始: {tid} ({theme['title_jp']})")

    file_ids = []
    for file_id, description in theme["specs"]:
        prompt = f"{description}\n{theme['common_note']}\n{COMMON_CONDITIONS}"
        out_path = os.path.join(MATERIALS_DIR, f"{file_id}-illust.png")
        ok = generate_one(page, file_id, prompt, out_path)
        if ok:
            file_ids.append(file_id)
        else:
            log(f"  失敗のためスキップ: {file_id}")
        time.sleep(5)  # レート制限対策

    if file_ids:
        add_to_data_ts(tid, theme["entries"])
        git_commit_push(tid, file_ids)
        log(f"テーマ完了: {tid} ({len(file_ids)}/4枚)")
    else:
        log(f"テーマ失敗: {tid} — 全枚数失敗")

    return len(file_ids)


# =========================================================
# メイン
# =========================================================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--theme", help="特定テーマのみ実行")
    parser.add_argument("--all", action="store_true", help="全テーマを順番に実行")
    parser.add_argument("--headless", action="store_true", help="ヘッドレスモード")
    args = parser.parse_args()

    targets = THEMES
    if args.theme:
        targets = [t for t in THEMES if t["id"] == args.theme]
        if not targets:
            print(f"ERROR: theme '{args.theme}' が見つかりません")
            sys.exit(1)

    with sync_playwright() as p:
        # 起動中のChromeにCDP接続（ボット検出を完全回避）
        browser = p.chromium.connect_over_cdp("http://localhost:9222")
        context = browser.contexts[0]
        page = context.new_page()

        total = 0
        for theme in targets:
            n = run_theme(page, theme)
            total += n
            log(f"累計生成枚数: {total}")
            time.sleep(10)  # テーマ間インターバル

        log(f"\n全処理完了。合計 {total} 枚生成。")
        browser.close()


if __name__ == "__main__":
    main()
