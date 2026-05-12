#!/usr/bin/env python3
"""
季節の行事テーマ 生成スクリプト（seasonal-events）

使い方:
  python3 scripts/batch_seasonal_events.py --item christmas --variant 1
  python3 scripts/batch_seasonal_events.py --all --variant 1   # 1巡目
  python3 scripts/batch_seasonal_events.py --all --variant 2   # 2巡目
  python3 scripts/batch_seasonal_events.py --all --variant 3   # 3巡目
"""

import os, sys, time, re, subprocess, argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://hdhogsjmdowevijxooiq.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
if not SUPABASE_KEY:
    print("ERROR: 環境変数 SUPABASE_SECRET_KEY を設定してください", file=sys.stderr)
    sys.exit(1)
BUCKET = "materials"
SUPABASE_BASE = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"

REPO_DIR  = Path(__file__).parent.parent
TMP_DIR   = REPO_DIR / "tmp_materials"
DATA_TS   = REPO_DIR / "src" / "lib" / "data.ts"
LOG_FILE  = Path(__file__).parent / "batch_seasonal_events.log"
FAILED_LOG = Path(__file__).parent / "failed_ids.txt"

CHROME_CMD = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--remote-debugging-port=9222",
    f'--user-data-dir={Path.home()}/.chatgpt-chrome-profile',
]

TMP_DIR.mkdir(exist_ok=True)

COMMON_CONDITIONS = """
共通条件
背景は必ず純白 #FFFFFF（オフホワイト・クリーム色・グレー味のかかった白は禁止）
線画スタイル（塗りつぶしなし）
輪郭線は太くはっきりと描き、細い線や掠れた線は使わない
A4横長・高画質
文字・テキスト・ラベル・枠線・フレームは一切入れない
イラスト1点のみ・コマ割りや複数構成にしない
""".strip()

# バリアント2・3 に追加するプロンプト修飾
VARIANT_SUFFIX = {
    1: "",
    2: "\n（前回と異なる構図で：主役要素・アングル・配置を変えてください）",
    3: "\n（前回・前々回とは異なる別の構図で：異なる要素を主役にして描いてください）",
}

# =========================================================
# アイテム定義（季節の行事）
# =========================================================
# 構造: item_id -> jp, season, note, scenes/titles/descs（variant1基準・v2/3は自動修飾）
# =========================================================
SEASONAL_ITEMS = {

    # ── 春 ───────────────────────────────────────────────

    "hinamatsuri": {
        "jp": "ひな祭り",
        "season": "spring",
        "note": "おひなさまはかわいいキャラクターデザインで。衣装の模様は輪郭線のみでシンプルに。",
        "scenes": {
            "simple": "ひな祭りの塗り絵。おだいりさまとおひなさまの2体のみ・背景なし・余白たっぷり。",
            "easy":   "ひな祭りの塗り絵。おだいりさまとおひなさまがひしもちとぼんぼりといっしょに並んでいる構図。",
            "normal": "ひな祭りの塗り絵。5段飾りのひなかざり全体の構図。おひなさま・さんにんかんじょ・ごにんばやし・ぼんぼりが並ぶ。",
            "rich":   "ひな祭りの塗り絵。保育園のひな祭りのお祝いの風景。子どもたちがひなかざりの前でよろこんでいるにぎやかな構図。",
        },
        "titles": {
            "simple": "おだいりさまとおひなさま",
            "easy":   "ひなかざり",
            "normal": "5だんかざり",
            "rich":   "ひなまつりのお祝い",
        },
        "descs": {
            "simple": "おだいりさまとおひなさまの線画。シンプルでかわいい。",
            "easy":   "ひなかざりの線画。ひしもちとぼんぼりつき。",
            "normal": "5段飾りのひなかざりの線画。全キャラクター登場。",
            "rich":   "保育園のひな祭りお祝いのにぎやかな線画。子どもたちつき。",
        },
    },

    "enrollment": {
        "jp": "入園・進級式",
        "season": "spring",
        "note": "明るくおめでたい雰囲気で。さくらの花びらはシンプルな5枚花びら。子どもはかわいいキャラクターデザインで。",
        "scenes": {
            "simple": "入園式の塗り絵。かわいいランドセル・つうえんバッグのみ・背景なし・余白たっぷり。",
            "easy":   "入園式の塗り絵。さくらが咲く中、子どもが園のげんかんに立っているかわいい構図。",
            "normal": "入園式の塗り絵。さくらの木の下で先生と子どもたちが入園式をしている構図。",
            "rich":   "入園式の塗り絵。さくら満開の園で子どもたちと先生がにぎやかにお祝いしている構図。",
        },
        "titles": {
            "simple": "ランドセルとバッグ",
            "easy":   "えんにはいるよ",
            "normal": "にゅうえんしき",
            "rich":   "にゅうえんおめでとう",
        },
        "descs": {
            "simple": "かわいいランドセルとつうえんバッグの線画。",
            "easy":   "さくら咲く中、園に入る子どもの線画。",
            "normal": "さくらの下の入園式の線画。先生と子どもたちつき。",
            "rich":   "さくら満開の入園式のにぎやかな線画。",
        },
    },

    "childrensday": {
        "jp": "こどもの日",
        "season": "spring",
        "note": "こいのぼりはカラフルな複数の鯉が空を泳ぐ形で。かぶとのこまかい模様は輪郭線のみでシンプルに。",
        "scenes": {
            "simple": "こどもの日の塗り絵。大きなこいのぼり1つのみ・背景なし・余白たっぷり。",
            "easy":   "こどもの日の塗り絵。青空の下でこいのぼりが風になびいている構図。",
            "normal": "こどもの日の塗り絵。こいのぼりとかぶとと柏餅が並ぶ構図。",
            "rich":   "こどもの日の塗り絵。大きなこいのぼりの下で子どもたちがにぎやかに遊ぶ構図。",
        },
        "titles": {
            "simple": "こいのぼり",
            "easy":   "そらをおよぐこいのぼり",
            "normal": "こどもの日のかざり",
            "rich":   "こいのぼりまつり",
        },
        "descs": {
            "simple": "シンプルなこいのぼりの線画。",
            "easy":   "青空を泳ぐこいのぼりの線画。",
            "normal": "こいのぼり・かぶと・柏餅の線画。",
            "rich":   "こいのぼりの下でにぎやかに遊ぶ子どもたちの線画。",
        },
    },

    "mothersday": {
        "jp": "母の日",
        "season": "spring",
        "note": "カーネーションは5枚花びらのシンプルなかわいいデザインで。人物は描かなくてOK。花・物を主役に。",
        "scenes": {
            "simple": "母の日の塗り絵。かわいいカーネーション1本のみ・背景なし・余白たっぷり。",
            "easy":   "母の日の塗り絵。カーネーションの花束がリボンで結ばれているかわいい構図。",
            "normal": "母の日の塗り絵。カーネーションの花束とかわいいプレゼントボックスとおてがみが並ぶ構図。",
            "rich":   "母の日の塗り絵。カーネーションの花束・プレゼント・メッセージカードがにぎやかに並ぶ構図。",
        },
        "titles": {
            "simple": "カーネーション",
            "easy":   "はなたば",
            "normal": "はははありがとう",
            "rich":   "母の日のプレゼント",
        },
        "descs": {
            "simple": "シンプルなカーネーション1本の線画。",
            "easy":   "カーネーションの花束の線画。",
            "normal": "花束とプレゼントとおてがみの線画。",
            "rich":   "母の日のギフトがにぎやかに並ぶ線画。",
        },
    },

    "excursion": {
        "jp": "遠足",
        "season": "spring",
        "note": "楽しい遠足の雰囲気で。バスはかわいいキャラクターデザイン可。子どもはかわいい顔でリュックを背負っている。",
        "scenes": {
            "simple": "遠足の塗り絵。かわいいリュックとおにぎりのみ・背景なし・余白たっぷり。",
            "easy":   "遠足の塗り絵。子どもがリュックを背負って遠足に出発する元気な構図。",
            "normal": "遠足の塗り絵。えんそくバスに子どもたちが乗り込んでいる構図。",
            "rich":   "遠足の塗り絵。公園でシートを広げてみんなでお弁当を食べるにぎやかな構図。",
        },
        "titles": {
            "simple": "えんそくのにもつ",
            "easy":   "えんそくにしゅっぱつ",
            "normal": "えんそくバス",
            "rich":   "こうえんでおべんとう",
        },
        "descs": {
            "simple": "リュックとおにぎりの線画。",
            "easy":   "リュック姿で出発する子どもの線画。",
            "normal": "えんそくバスに乗り込む子どもたちの線画。",
            "rich":   "公園でお弁当を食べるにぎやかな線画。",
        },
    },

    # ── 夏 ───────────────────────────────────────────────

    "fathersday": {
        "jp": "父の日",
        "season": "summer",
        "note": "ひまわりや黄色の花をメインに使う（父の日の定番カラー）。人物は描かなくてOK。花・物を主役に。",
        "scenes": {
            "simple": "父の日の塗り絵。かわいいネクタイのみ・背景なし・余白たっぷり。",
            "easy":   "父の日の塗り絵。ネクタイとプレゼントボックスとリボンのかわいい構図。",
            "normal": "父の日の塗り絵。ひまわりの花束とネクタイとメッセージカードが並ぶ構図。",
            "rich":   "父の日の塗り絵。ひまわり・ネクタイ・プレゼント・メッセージカードがにぎやかに並ぶ構図。",
        },
        "titles": {
            "simple": "ネクタイ",
            "easy":   "おとうさんへのプレゼント",
            "normal": "ちちははありがとう",
            "rich":   "父の日のプレゼント",
        },
        "descs": {
            "simple": "シンプルなネクタイの線画。",
            "easy":   "ネクタイとプレゼントボックスの線画。",
            "normal": "ひまわり・ネクタイ・カードの線画。",
            "rich":   "父の日のギフトがにぎやかに並ぶ線画。",
        },
    },

    "tanabata": {
        "jp": "七夕",
        "season": "summer",
        "note": "笹の葉はシンプルな細長い葉で。短冊や飾りはさまざまな形でかわいく。おりひめとひこぼしは和装のかわいいキャラクターで。",
        "scenes": {
            "simple": "七夕の塗り絵。かわいいたんざくが飾られた笹の枝のみ・背景なし・余白たっぷり。",
            "easy":   "七夕の塗り絵。笹の木にたんざくや七夕飾りが飾られているかわいい構図。",
            "normal": "七夕の塗り絵。おりひめとひこぼしが天の川をはさんで向かい合っている構図。星が点在。",
            "rich":   "七夕の塗り絵。保育園の七夕飾りを子どもたちが飾るにぎやかな構図。笹・短冊・飾りが点在。",
        },
        "titles": {
            "simple": "たなばたのたんざく",
            "easy":   "ささのはかざり",
            "normal": "おりひめとひこぼし",
            "rich":   "たなばたまつり",
        },
        "descs": {
            "simple": "短冊が飾られた笹の線画。",
            "easy":   "七夕飾りがついた笹の木の線画。",
            "normal": "おりひめとひこぼしが向かい合う天の川の線画。",
            "rich":   "保育園の七夕飾りのにぎやかな線画。子どもたちつき。",
        },
    },

    "pool": {
        "jp": "プール",
        "season": "summer",
        "note": "水の波紋はシンプルな弧線で表現。子どもはかわいいキャラクターデザインで水着姿。水鉄砲やうきわは明確な形で。",
        "scenes": {
            "simple": "プールの塗り絵。かわいいうきわとゴーグルのみ・背景なし・余白たっぷり。",
            "easy":   "プールの塗り絵。子どもがうきわをつけてプールで遊んでいるかわいい構図。",
            "normal": "プールの塗り絵。子どもたちがビート板やうきわでプールを楽しんでいる構図。",
            "rich":   "プールの塗り絵。保育園のプールで子どもたちが水鉄砲やうきわで遊ぶにぎやかな夏の構図。",
        },
        "titles": {
            "simple": "うきわとゴーグル",
            "easy":   "プールであそぼう",
            "normal": "みんなでプール",
            "rich":   "なつのプールびより",
        },
        "descs": {
            "simple": "うきわとゴーグルの線画。",
            "easy":   "うきわでプール遊びをする子どもの線画。",
            "normal": "プールで遊ぶ子どもたちの線画。",
            "rich":   "保育園のプールでにぎやかに遊ぶ子どもたちの線画。",
        },
    },

    "summerfestival": {
        "jp": "夏祭り",
        "season": "summer",
        "note": "提灯・やぐらをメインに夏祭りの雰囲気で。屋台の食べ物はシンプルなかわいいデザインで。浴衣姿の子どもはかわいいキャラクターで。",
        "scenes": {
            "simple": "夏祭りの塗り絵。かわいいちょうちん1つのみ・背景なし・余白たっぷり。",
            "easy":   "夏祭りの塗り絵。ちょうちんが並んだ夏祭りの屋台前の構図。わたあめやかきごおりが見える。",
            "normal": "夏祭りの塗り絵。やぐらの周りにちょうちんが飾られ、子どもたちが盆踊りをしている構図。",
            "rich":   "夏祭りの塗り絵。浴衣の子どもたちがきんぎょすくいやヨーヨーつりを楽しむにぎやかなお祭りの構図。",
        },
        "titles": {
            "simple": "なつまつりのちょうちん",
            "easy":   "やたいならべ",
            "normal": "ぼんおどり",
            "rich":   "にぎやかなおまつり",
        },
        "descs": {
            "simple": "シンプルな提灯の線画。",
            "easy":   "ちょうちんと屋台が並ぶ夏祭りの線画。",
            "normal": "やぐらと盆踊りの子どもたちの線画。",
            "rich":   "夏祭りで遊ぶ子どもたちのにぎやかな線画。",
        },
    },

    # ── 秋 ───────────────────────────────────────────────

    "tsukimi": {
        "jp": "お月見",
        "season": "autumn",
        "note": "月は大きな満月で。月のうさぎはかわいいシルエットで月の中に描く。ススキはシンプルな穂の形で。",
        "scenes": {
            "simple": "お月見の塗り絵。大きな満月とうさぎのみ・背景なし・余白たっぷり。",
            "easy":   "お月見の塗り絵。満月とすすきとお月見だんごが並ぶかわいい構図。",
            "normal": "お月見の塗り絵。月の中にうさぎがいて、下にすすきとおだんごが飾られている構図。",
            "rich":   "お月見の塗り絵。縁側（えんがわ）でお月見をする子どもたちと満月のにぎやかな秋の夜の構図。",
        },
        "titles": {
            "simple": "まんまるおつき",
            "easy":   "おつきみのかざり",
            "normal": "つきのうさぎ",
            "rich":   "えんがわでおつきみ",
        },
        "descs": {
            "simple": "満月とうさぎの線画。",
            "easy":   "満月・ススキ・だんごのお月見飾りの線画。",
            "normal": "月の中のうさぎとすすきとだんごの線画。",
            "rich":   "縁側でお月見をする子どもたちのにぎやかな線画。",
        },
    },

    "sports": {
        "jp": "運動会",
        "season": "autumn",
        "note": "運動会の元気な雰囲気で。メダル・トロフィーはシンプルでかわいいデザイン。子どもたちはかわいいキャラクターデザインで。",
        "scenes": {
            "simple": "運動会の塗り絵。かわいいメダルのみ・背景なし・余白たっぷり。",
            "easy":   "運動会の塗り絵。子どもがかけっこでゴールテープを切っているかわいい構図。",
            "normal": "運動会の塗り絵。子どもたちがたまいれをしている運動会の構図。かごとボールが点在。",
            "rich":   "運動会の塗り絵。つなひき・かけっこ・たまいれが同時に行われる運動会のにぎやかな構図。",
        },
        "titles": {
            "simple": "うんどうかいのメダル",
            "easy":   "かけっこゴール",
            "normal": "たまいれ",
            "rich":   "にぎやかうんどうかい",
        },
        "descs": {
            "simple": "かわいいメダルの線画。",
            "easy":   "ゴールテープを切る子どもの線画。",
            "normal": "玉入れをする子どもたちの線画。",
            "rich":   "運動会のにぎやかな全体の線画。",
        },
    },

    "imohori": {
        "jp": "いもほり",
        "season": "autumn",
        "note": "さつまいもは丸みのある紡錘形でかわいく。子どもたちは泥まみれで楽しそうな表情で。土から出てくるいもがわかりやすく。",
        "scenes": {
            "simple": "いもほりの塗り絵。かわいいさつまいも1本のみ・背景なし・余白たっぷり。",
            "easy":   "いもほりの塗り絵。子どもがさつまいもをシャベルで掘っているかわいい構図。",
            "normal": "いもほりの塗り絵。子どもたちが畑で芋ほりをしている構図。大きないもが次々と出てくる。",
            "rich":   "いもほりの塗り絵。保育園の畑で子どもたちが芋ほりを楽しむにぎやかな秋の構図。かごに山盛りのいも。",
        },
        "titles": {
            "simple": "さつまいも",
            "easy":   "いもをほったよ",
            "normal": "みんないもほり",
            "rich":   "いもほりたいかい",
        },
        "descs": {
            "simple": "シンプルなさつまいもの線画。",
            "easy":   "芋を掘る子どもの線画。",
            "normal": "みんなで芋ほりをする線画。",
            "rich":   "保育園の芋ほりのにぎやかな線画。",
        },
    },

    "halloween": {
        "jp": "ハロウィン",
        "season": "autumn",
        "note": "かぼちゃのジャックオランタンはシンプルなかわいい顔つきで。おばけはかわいいデザインで怖くしない。",
        "scenes": {
            "simple": "ハロウィンの塗り絵。かわいいジャックオランタン（かぼちゃ）のみ・背景なし・余白たっぷり。",
            "easy":   "ハロウィンの塗り絵。かぼちゃとかわいいおばけとこうもりの構図。",
            "normal": "ハロウィンの塗り絵。まじょのぼうし・かぼちゃ・おばけ・くろねこが並ぶ構図。",
            "rich":   "ハロウィンの塗り絵。仮装した子どもたちがお菓子をもらいながらにぎやかに歩く構図。",
        },
        "titles": {
            "simple": "かぼちゃのランタン",
            "easy":   "かわいいおばけ",
            "normal": "ハロウィンのかざり",
            "rich":   "トリックオアトリート",
        },
        "descs": {
            "simple": "かわいいジャックオランタンの線画。",
            "easy":   "かぼちゃ・おばけ・こうもりの線画。",
            "normal": "ハロウィンアイテムが並ぶ線画。",
            "rich":   "仮装した子どもたちのにぎやかなハロウィンの線画。",
        },
    },

    "shichigosan": {
        "jp": "七五三",
        "season": "autumn",
        "note": "ちとせあめは長い袋入りのキャンディでかわいく。着物・袴はシンプルな和装でかわいいデザインで。",
        "scenes": {
            "simple": "七五三の塗り絵。かわいいちとせあめのみ・背景なし・余白たっぷり。",
            "easy":   "七五三の塗り絵。ちとせあめを持った着物姿の女の子の構図。",
            "normal": "七五三の塗り絵。袴姿の男の子と着物姿の女の子がちとせあめを持って並んでいる構図。",
            "rich":   "七五三の塗り絵。七五三のお参りをする子どもたちと神社の鳥居のにぎやかな構図。",
        },
        "titles": {
            "simple": "ちとせあめ",
            "easy":   "きものでおまいり",
            "normal": "しちごさん",
            "rich":   "しちごさんのおまいり",
        },
        "descs": {
            "simple": "千歳飴の線画。",
            "easy":   "着物姿で千歳飴を持つ女の子の線画。",
            "normal": "七五三の男の子と女の子が並ぶ線画。",
            "rich":   "七五三のお参りのにぎやかな線画。鳥居つき。",
        },
    },

    # ── 冬 ───────────────────────────────────────────────

    "christmas": {
        "jp": "クリスマス",
        "season": "winter",
        "note": "サンタはかわいいキャラクターデザインで。ツリーのかざりは輪郭線のみでシンプルに。宗教色を出さない。",
        "scenes": {
            "simple": "クリスマスの塗り絵。かわいいクリスマスツリーのみ・背景なし・余白たっぷり。",
            "easy":   "クリスマスの塗り絵。クリスマスツリーとプレゼントボックスとベルの構図。",
            "normal": "クリスマスの塗り絵。かわいいサンタクロースとトナカイとプレゼントの構図。",
            "rich":   "クリスマスの塗り絵。クリスマス会をする子どもたちと大きなツリーのにぎやかな構図。",
        },
        "titles": {
            "simple": "クリスマスツリー",
            "easy":   "クリスマスのかざり",
            "normal": "サンタとトナカイ",
            "rich":   "クリスマスかい",
        },
        "descs": {
            "simple": "かわいいクリスマスツリーの線画。",
            "easy":   "ツリー・プレゼント・ベルのクリスマス飾りの線画。",
            "normal": "サンタとトナカイとプレゼントの線画。",
            "rich":   "クリスマス会のにぎやかな線画。子どもたちとツリーつき。",
        },
    },

    "mochitsuki": {
        "jp": "もちつき",
        "season": "winter",
        "note": "うすは大きな木製の樽型で。きねは長い棒状で。もちはぷくっとしたまるい形でかわいく。",
        "scenes": {
            "simple": "もちつきの塗り絵。かわいいうすときねのみ・背景なし・余白たっぷり。",
            "easy":   "もちつきの塗り絵。うすのまわりにきなこもちやあんこもちが並んでいるかわいい構図。",
            "normal": "もちつきの塗り絵。子どもがきねをもってもちをついている構図。うすと応援する人もいる。",
            "rich":   "もちつきの塗り絵。保育園のもちつき大会のにぎやかな構図。順番を待つ子どもたちつき。",
        },
        "titles": {
            "simple": "うすときね",
            "easy":   "おもちがならんだ",
            "normal": "もちつきぺったん",
            "rich":   "もちつきたいかい",
        },
        "descs": {
            "simple": "うすときねの線画。",
            "easy":   "きなこもちやあんこもちが並ぶ線画。",
            "normal": "子どもがもちをつく線画。うすつき。",
            "rich":   "保育園のもちつき大会のにぎやかな線画。",
        },
    },

    "newyear": {
        "jp": "お正月",
        "season": "winter",
        "note": "かどまつは松・竹・梅をシンプルに。だるまは赤くてかわいい丸い形で。こまは真上から見た形で。",
        "scenes": {
            "simple": "お正月の塗り絵。かわいいかどまつとかがみもちのみ・背景なし・余白たっぷり。",
            "easy":   "お正月の塗り絵。だるまとこまとはねつきの羽子板が並ぶかわいい構図。",
            "normal": "お正月の塗り絵。かどまつ・しめなわ・かがみもち・だるまが並ぶお正月飾りの構図。",
            "rich":   "お正月の塗り絵。子どもたちがたこあげやこままわしをしているにぎやかなお正月の構図。",
        },
        "titles": {
            "simple": "お正月のかざり",
            "easy":   "だるまとこま",
            "normal": "お正月ならべ",
            "rich":   "あけましておめでとう",
        },
        "descs": {
            "simple": "かどまつとかがみもちの線画。",
            "easy":   "だるま・こま・羽子板の線画。",
            "normal": "お正月飾りが並ぶにぎやかな線画。",
            "rich":   "たこあげとこままわしをする子どもたちの線画。",
        },
    },

    "setsubun": {
        "jp": "節分",
        "season": "winter",
        "note": "おにはかわいいデザインで怖くしない。ツノは短く、顔はにこやか。まめはシンプルな丸い豆粒で。",
        "scenes": {
            "simple": "節分の塗り絵。かわいいあかおにのみ・背景なし・余白たっぷり。",
            "easy":   "節分の塗り絵。おにとますとまめが並ぶかわいい構図。",
            "normal": "節分の塗り絵。子どもがおにめがけてまめをなげている節分の構図。",
            "rich":   "節分の塗り絵。保育園の節分豆まきのにぎやかな構図。おに役の先生と豆を投げる子どもたち。",
        },
        "titles": {
            "simple": "かわいいおに",
            "easy":   "おにはそとふくはうち",
            "normal": "まめまき",
            "rich":   "にぎやかせつぶん",
        },
        "descs": {
            "simple": "かわいいあかおにの線画。",
            "easy":   "おに・ます・まめの節分アイテムの線画。",
            "normal": "まめまきをする子どもの線画。",
            "rich":   "保育園の節分まめまきのにぎやかな線画。",
        },
    },

    # ── 通年 ─────────────────────────────────────────────

    "graduation": {
        "jp": "卒園式",
        "season": "spring",
        "note": "卒園証書は巻き物スタイルでかわいく。がくし帽は黒い四角い帽子で。子どもはかわいい礼服・晴れ着で。",
        "scenes": {
            "simple": "卒園式の塗り絵。かわいいそつえんしょうしょとはなたばのみ・背景なし・余白たっぷり。",
            "easy":   "卒園式の塗り絵。がくし帽をかぶった子どもがそつえんしょうしょを持っているかわいい構図。",
            "normal": "卒園式の塗り絵。子どもたちが卒園証書をもらう場面の構図。先生と並ぶ。",
            "rich":   "卒園式の塗り絵。さくら満開の中、卒園式を終えた子どもたちがにぎやかに喜ぶ構図。",
        },
        "titles": {
            "simple": "そつえんしょうしょ",
            "easy":   "そつえんおめでとう",
            "normal": "そつえんしき",
            "rich":   "そつえんおいわい",
        },
        "descs": {
            "simple": "卒園証書と花束の線画。",
            "easy":   "がくし帽姿で証書を持つ子どもの線画。",
            "normal": "卒園式の証書授与シーンの線画。",
            "rich":   "さくらの下で喜ぶ卒園生のにぎやかな線画。",
        },
    },

    "birthday": {
        "jp": "誕生日",
        "season": None,
        "note": "バースデーケーキはろうそくつきでかわいいデザインで。かんむりはシンプルな星形の飾りで。ふうせんは丸くかわいく。",
        "scenes": {
            "simple": "誕生日の塗り絵。かわいいバースデーケーキのみ・背景なし・余白たっぷり。",
            "easy":   "誕生日の塗り絵。バースデーケーキとプレゼントボックスとふうせんの構図。",
            "normal": "誕生日の塗り絵。子どもがかんむりをかぶってケーキのろうそくを吹いている構図。",
            "rich":   "誕生日の塗り絵。保育園の誕生日会のにぎやかな構図。ケーキ・ふうせん・ぱーてぃーひも・友だちつき。",
        },
        "titles": {
            "simple": "バースデーケーキ",
            "easy":   "おたんじょうびのかざり",
            "normal": "ハッピーバースデー",
            "rich":   "たんじょうびかい",
        },
        "descs": {
            "simple": "かわいいバースデーケーキの線画。",
            "easy":   "ケーキ・プレゼント・ふうせんの誕生日飾りの線画。",
            "normal": "誕生日ケーキのろうそくを吹く子どもの線画。",
            "rich":   "保育園の誕生日会のにぎやかな線画。",
        },
    },
}

# =========================================================
# ユーティリティ（generate_park.py と同じ）
# =========================================================
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


def add_to_data_ts(entries, supabase_urls, item_id, season):
    content = DATA_TS.read_text()
    if f"id: '{entries[0][0]}'" in content:
        log(f"  data.ts に既存: {entries[0][0]} — スキップ")
        return False

    season_field = f"\n    season: '{season}'," if season else ""
    block = ""
    for file_id, title, desc, age_min, age_max, diff, dur, tools in entries:
        url = supabase_urls.get(file_id, "")
        if not url:
            continue
        block += f"""  {{
    id: '{file_id}',
    title: '{title}',
    description: '{desc}',
    ageMin: {age_min}, ageMax: {age_max}, difficulty: {diff}, duration: {dur},
    category: 'coloring', theme: 'seasonal-events', event: '{item_id}',{season_field}
    tags: ['{item_id}', '行事', 'ぬりえ'],
    tools: ['{tools}'],
    activityIdeas: [
      '好きな色で塗ってみよう',
      'この行事について話しながら塗ろう',
    ],
    imageUrl: '{url}',
    illustUrl: '{url}',
    illustVersion: 1,
    imageStatus: 'pending_review',
    pdfUrl: '',
    createdAt: '{time.strftime("%Y-%m-%dT%H:%M")}',
    popular: false,
  }},
"""

    insert_pos = content.rfind('},', 0, content.find(']\n\nexport type SortKey')) + 2
    new_content = content[:insert_pos] + '\n' + block.rstrip(',\n') + ',' + content[insert_pos:]
    DATA_TS.write_text(new_content)
    log(f"  data.ts 更新完了: {item_id}")
    return True


def git_commit_push(item_id, variant):
    subprocess.run(["git", "add", "src/lib/data.ts"], cwd=REPO_DIR, check=True)
    msg = f"Add seasonal-events/{item_id}-{variant} coloring pages"
    subprocess.run(["git", "commit", "-m", msg], cwd=REPO_DIR, check=True)
    subprocess.run(["git", "push", "origin", "main"], cwd=REPO_DIR, check=True)
    log(f"  push 完了: {item_id}-{variant}")


# =========================================================
# ChatGPT 操作（generate_park.py と同じ）
# =========================================================
ERROR_PHRASES = [
    "画像生成に失敗",
    "画像を作成できません",
    "もう一度リクエストしてください",
    "image generation failed",
    "couldn't generate",
    "unable to generate",
]


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
        if result:
            log(f"  チャット削除: {conv_id[:8]}...")
        return bool(result)
    except Exception as e:
        log(f"  チャット削除失敗: {e}")
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
        log(f"  プロンプト送信。生成待ち...")

        status, img_src = wait_for_image(page, timeout=240)
        if status == 'ok':
            ok = download_image(page, img_src, out_path)
            if ok:
                log(f"  ローカル保存: {out_path}")
                delete_current_chat(page)
                return True
            log(f"  DL失敗、リトライ")
        elif status == 'error':
            log(f"  ChatGPTエラー検知、リトライ")
            delete_current_chat(page)
        else:
            log(f"  タイムアウト、リトライ")
        time.sleep(5)

    log(f"  最大リトライ到達、失敗: {file_id}")
    return False


def notify_mac(title, msg):
    try:
        subprocess.run([
            "osascript", "-e",
            f'display notification "{msg}" with title "{title}"'
        ], check=False)
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
    log("  [復旧] Chrome再接続できず。")
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

    log(f"  [復旧③] スキップ: {file_id}")
    with open(FAILED_LOG, "a") as f:
        f.write(f"{time.strftime('%Y-%m-%dT%H:%M:%S')} {file_id}\n")
    notify_mac("ぬりえ生成失敗", f"{file_id} をスキップしました")
    return False


# =========================================================
# 生成実行
# =========================================================
UNITS = ["simple", "easy", "normal", "rich"]

UNIT_PARAMS = {
    "simple": (2, 4, 1, 10,  "クレヨン"),
    "easy":   (3, 5, 2, 15,  "クレヨン・色えんぴつ"),
    "normal": (3, 6, 3, 20,  "色えんぴつ"),
    "rich":   (4, 6, 4, 30,  "色えんぴつ"),
}


def make_specs(item_id, variant, scenes, note):
    suffix = VARIANT_SUFFIX.get(variant, "")
    return [
        (f"{item_id}-{u}-{variant}", scenes[u] + suffix + f"\n{note}")
        for u in UNITS
    ]


def make_entries(item_id, variant, titles, descs):
    return [
        (f"{item_id}-{u}-{variant}", titles[u], descs[u], *UNIT_PARAMS[u])
        for u in UNITS
    ]


def run_variant(pw, state, item_id, variant, client):
    item = SEASONAL_ITEMS[item_id]
    log(f"\n{'='*50}\nアイテム開始: {item_id}-v{variant} ({item['jp']})")

    specs   = make_specs(item_id, variant, item["scenes"], item["note"])
    entries = make_entries(item_id, variant, item["titles"], item["descs"])

    supabase_urls = {}
    for file_id, prompt in specs:
        full_prompt = f"{prompt}\n{COMMON_CONDITIONS}"
        local_path  = TMP_DIR / f"{file_id}-illust.png"
        ok = generate_with_recovery(pw, state, file_id, full_prompt, local_path)
        if not ok:
            continue
        try:
            url = upload_to_supabase(client, local_path, f"{file_id}-illust.png")
            supabase_urls[file_id] = url
            log(f"  Supabaseアップ完了: {url}")
        except Exception as e:
            log(f"  Supabaseアップ失敗: {file_id} — {e}")
        time.sleep(5)

    if supabase_urls:
        if add_to_data_ts(entries, supabase_urls, item_id, item["season"]):
            git_commit_push(item_id, variant)

    log(f"完了: {item_id}-v{variant} ({len(supabase_urls)}/4枚)")
    return len(supabase_urls)


# =========================================================
# メイン
# =========================================================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--item",    default="christmas", help="アイテムID")
    parser.add_argument("--variant", type=int, default=1, choices=[1, 2, 3], help="バリアント番号 (1/2/3)")
    parser.add_argument("--all",     action="store_true", help="全アイテムを順番に実行")
    args = parser.parse_args()

    if not args.all and args.item not in SEASONAL_ITEMS:
        log(f"ERROR: '{args.item}' の定義がありません")
        log(f"利用可能なアイテム: {', '.join(SEASONAL_ITEMS.keys())}")
        sys.exit(1)

    client = supabase_client()

    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp("http://localhost:9222")
        except Exception:
            log("ERROR: Chrome CDP接続失敗。以下で起動してください:")
            log('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.chatgpt-chrome-profile"')
            sys.exit(1)

        context = browser.contexts[0]
        page    = context.new_page()
        state   = {'browser': browser, 'page': page}

        total = 0
        if args.all:
            for iid in SEASONAL_ITEMS:
                n = run_variant(p, state, iid, args.variant, client)
                total += n
                log(f"累計: {total}枚")
                time.sleep(60)  # レート制限対策
        else:
            total = run_variant(p, state, args.item, args.variant, client)

        state['browser'].close()
        log(f"\n全処理完了。合計 {total} 枚生成。")


if __name__ == "__main__":
    main()
