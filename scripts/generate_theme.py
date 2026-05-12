#!/usr/bin/env python3
"""Generate coloring book images for a theme using gpt-image-2."""

import os
import sys
import base64
from openai import OpenAI

MATERIALS_DIR = os.path.join(os.path.dirname(__file__), "../public/materials")

COMMON_CONDITIONS = """共通条件
白背景・線画スタイル（塗りつぶしなし）
輪郭線は太くはっきりと描き、細い線や掠れた線は使わない
A4横長・高画質
文字・テキスト・ラベル・枠線・フレームは一切入れない
イラスト1点のみ・コマ割りや複数構成にしない"""

THEMES = {
    "train": {
        "specs": [
            ("train-simple-1", "かわいいでんしゃの塗り絵。でんしゃ1両のみ・横向き・背景なし・余白たっぷり。"),
            ("train-easy-1",   "かわいいでんしゃの塗り絵。でんしゃが青空の下を線路の上で走っている構図。山や木が遠くに見える。"),
            ("train-normal-1", "かわいいでんしゃの塗り絵。でんしゃが駅に到着している構図。ホーム・駅の建物・時計が点在。"),
            ("train-rich-1",   "かわいいでんしゃの塗り絵。でんしゃが町の中を走るにぎやかな構図。駅・建物・橋・山・太陽が点在。"),
        ],
        "common_note": "でんしゃに顔はつけない。車体はシンプルでかわいいデザイン。窓や扉はシンプルな四角の輪郭線のみで表現し、子どもが塗りやすい形にする。",
    },
    "car": {
        "specs": [
            ("car-simple-1", "かわいいじどうしゃの塗り絵。じどうしゃ1台のみ・正面向き・背景なし・余白たっぷり。"),
            ("car-easy-1",   "かわいいじどうしゃの塗り絵。かわいいじどうしゃが青空の下をにっこり顔で走っている構図。"),
            ("car-normal-1", "かわいいじどうしゃの塗り絵。2台のじどうしゃが町の道を仲良く走っている構図。道・建物・木が点在。"),
            ("car-rich-1",   "かわいいじどうしゃの塗り絵。たくさんのじどうしゃやバスやトラックが町の通りをにぎやかに走る構図。信号・建物・木・太陽が点在。"),
        ],
        "common_note": "タイヤや窓はシンプルな丸や四角の輪郭線のみで表現し、子どもが塗りやすい形にする。じどうしゃはかわいい顔つきのキャラクターデザインにする。",
    },
    "goat": {
        "specs": [
            ("goat-simple-1", "かわいいヤギの塗り絵。ヤギ1匹のみ・正面向き・背景なし・余白たっぷり。"),
            ("goat-easy-1",   "かわいいヤギの塗り絵。ヤギの子どもが草を食べているかわいい構図。"),
            ("goat-normal-1", "かわいいヤギの塗り絵。母ヤギと子どもが牧場でのんびり過ごしている親子の構図。"),
            ("goat-rich-1",   "かわいいヤギの塗り絵。ヤギ家族が緑の丘で過ごすにぎやかな構図。木・草・花・太陽が点在。"),
        ],
        "common_note": "ヤギのひげと角はシンプルにかわいく描き、小さな子でも塗りやすい形にする。",
    },
    "cow": {
        "specs": [
            ("cow-simple-1", "かわいいウシの塗り絵。ウシ1匹のみ・正面向き・背景なし・余白たっぷり。"),
            ("cow-easy-1",   "かわいいウシの塗り絵。ウシの子どもがお花畑でにっこりしているかわいい構図。"),
            ("cow-normal-1", "かわいいウシの塗り絵。母ウシと子どもが牧場の草原でのんびりしている親子の構図。"),
            ("cow-rich-1",   "かわいいウシの塗り絵。ウシ家族が広い牧場で過ごすにぎやかな構図。農場の小屋・草・花・太陽が点在。"),
        ],
        "common_note": "ウシのもようはシンプルな丸や楕円の輪郭線のみで表現し、黒く塗りつぶさず子どもが自由に塗れる形にする。",
    },
    "crocodile": {
        "specs": [
            ("crocodile-simple-1", "かわいいワニの塗り絵。ワニ1匹のみ・正面向き・背景なし・余白たっぷり。"),
            ("crocodile-easy-1",   "かわいいワニの塗り絵。ワニの子どもが川べりでのんびりひなたぼっこしている構図。"),
            ("crocodile-normal-1", "かわいいワニの塗り絵。母ワニと子どもが川のほとりで仲良く並んでいる親子の構図。"),
            ("crocodile-rich-1",   "かわいいワニの塗り絵。ワニ家族が熱帯の川辺で過ごすにぎやかな構図。ヤシの木・草・太陽が点在。"),
        ],
        "common_note": "ワニのうろこ模様はシンプルな格子状の輪郭線のみで表現し、黒く塗りつぶさず子どもが塗りやすい形にする。口は大きく開けず、かわいい笑顔の表情にする。",
    },
    "camel": {
        "specs": [
            ("camel-simple-1", "かわいいラクダの塗り絵。ラクダ1匹のみ・正面向き・背景なし・余白たっぷり。"),
            ("camel-easy-1",   "かわいいラクダの塗り絵。ラクダの子どもがのんびりすわっているかわいい構図。"),
            ("camel-normal-1", "かわいいラクダの塗り絵。母ラクダと子どもが砂漠でならんで歩いている親子の構図。"),
            ("camel-rich-1",   "かわいいラクダの塗り絵。ラクダ家族が砂漠のオアシスで過ごすにぎやかな構図。ヤシの木・砂丘・太陽が点在。"),
        ],
        "common_note": "ラクダのこぶはわかりやすくシンプルな丸みのある形で描き、子どもが塗りやすい形にする。",
    },
    "zebra": {
        "specs": [
            ("zebra-simple-1", "かわいいシマウマの塗り絵。シマウマ1匹のみ・正面向き・背景なし・余白たっぷり。"),
            ("zebra-easy-1",   "かわいいシマウマの塗り絵。シマウマの子どもが草を1本くわえてにっこりしている構図。"),
            ("zebra-normal-1", "かわいいシマウマの塗り絵。母シマウマと子どもが草原でじゃれ合っている親子の構図。"),
            ("zebra-rich-1",   "かわいいシマウマの塗り絵。シマウマ家族がアフリカのサバンナで過ごすにぎやかな構図。アカシアの木・草・太陽が点在。"),
        ],
        "common_note": "シマウマの縞模様は黒く塗りつぶさず、白いまま縞の輪郭線のみで表現し、子どもが縞を塗れるようにする。",
    },
}


def generate(theme: str):
    api_key_path = os.path.join(os.path.dirname(__file__), "../.env.local")
    api_key = None
    if os.path.exists(api_key_path):
        with open(api_key_path) as f:
            for line in f:
                if line.startswith("OPENAI_API_KEY="):
                    api_key = line.strip().split("=", 1)[1]
    if not api_key:
        api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found")
        sys.exit(1)

    if theme not in THEMES:
        print(f"ERROR: theme '{theme}' not defined")
        sys.exit(1)

    cfg = THEMES[theme]
    client = OpenAI(api_key=api_key)

    print(f"Generating 4 images for theme: {theme}")

    for file_id, description in cfg["specs"]:
        prompt = f"{description}\n{cfg['common_note']}\n{COMMON_CONDITIONS}"
        filename = f"{file_id}-illust.png"
        out_path = os.path.join(MATERIALS_DIR, filename)
        print(f"\nGenerating {filename}...")
        print(f"  Prompt: {prompt[:100]}...")

        response = client.images.generate(
            model="gpt-image-2",
            prompt=prompt,
            size="1536x1024",
            quality="medium",
            n=1,
            output_format="png",
        )

        image_data = base64.b64decode(response.data[0].b64_json)
        with open(out_path, "wb") as f:
            f.write(image_data)
        print(f"  Saved: {out_path}")

    print(f"\nDone! 4 images generated for theme: {theme}")


if __name__ == "__main__":
    theme = sys.argv[1] if len(sys.argv) > 1 else "zebra"
    generate(theme)
