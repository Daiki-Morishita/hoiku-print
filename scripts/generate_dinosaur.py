#!/usr/bin/env python3
"""
恐竜シリーズ生成スクリプト

新フロー:
1. Chrome (CDP接続) で ChatGPT を操作してイラスト生成
2. ローカル一時保存 → Supabase Storage にアップロード
3. data.ts に Supabase URL で登録
4. git commit & push

使い方:
  python3 scripts/generate_dinosaur.py --theme tyrannosaurus --variant 1
  python3 scripts/generate_dinosaur.py --theme tyrannosaurus  # 全variant
  python3 scripts/generate_dinosaur.py --all
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

REPO_DIR = Path(__file__).parent.parent
TMP_DIR = REPO_DIR / "tmp_materials"
DATA_TS = REPO_DIR / "src" / "lib" / "data.ts"
LOG_FILE = Path(__file__).parent / "generate_dinosaur.log"
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

# =========================================================
# テーマ定義（恐竜）
# =========================================================
def make_specs(theme_id, jp_name, variant, scenes):
    """4難易度 × 指定variantの specs を生成"""
    levels = ["simple", "easy", "normal", "rich"]
    return [
        (f"{theme_id}-{lv}-{variant}", scenes[lv])
        for lv in levels
    ]

def make_entries(theme_id, jp_name, variant, titles, descs):
    """4難易度 × 指定variantの data.ts entries を生成"""
    levels = ["simple", "easy", "normal", "rich"]
    params = {
        "simple": (3, 5, 1, 10, "クレヨン"),
        "easy":   (3, 6, 2, 15, "クレヨン"),
        "normal": (4, 6, 3, 20, "色えんぴつ"),
        "rich":   (4, 6, 4, 30, "色えんぴつ"),
    }
    return [
        (f"{theme_id}-{lv}-{variant}", titles[lv], descs[lv], *params[lv])
        for lv in levels
    ]

# 恐竜定義: 各恐竜の特徴と共通注意点
DINOSAURS = {
    "velociraptor": {
        "jp": "ヴェロキラプトル",
        "note": "ヴェロキラプトルの細身で素早い体つき、長い尻尾、後ろ足の鋭いカギ爪、小さな羽毛をシンプルでかわいく描く。鋭い顔は子ども向けに親しみやすくする。",
        "variants": {
            1: {
                "scenes": {
                    "simple": "かわいいヴェロキラプトルの塗り絵。ヴェロキラプトル1匹のみ・横向きで立つ姿・背景なし・余白たっぷり。",
                    "easy":   "かわいいヴェロキラプトルの塗り絵。ヴェロキラプトルが森の中を走っているかわいい構図。シダ植物つき。",
                    "normal": "かわいいヴェロキラプトルの塗り絵。2匹のヴェロキラプトルが群れで森を駆ける構図。木とシダが点在。",
                    "rich":   "かわいいヴェロキラプトルの塗り絵。ヴェロキラプトルの群れが太古の森でにぎやかに過ごす構図。木・シダ・岩・卵が点在。",
                },
                "titles": {
                    "simple": "かわいいヴェロキラプトル",
                    "easy":   "もりのヴェロキラプトル",
                    "normal": "むれのヴェロキラプトル",
                    "rich":   "ヴェロキラプトルのかぞく",
                },
                "descs": {
                    "simple": "シンプルなヴェロキラプトルの線画。素早い体つきと長い尻尾がかわいい。",
                    "easy":   "森を走るヴェロキラプトルの線画。シダ植物つき。",
                    "normal": "2匹で駆けるヴェロキラプトルの線画。木とシダつき。",
                    "rich":   "太古の森で過ごすヴェロキラプトルの群れのにぎやかな線画。卵つき。",
                },
            },
        },
    },
    "spinosaurus": {
        "jp": "スピノサウルス",
        "note": "スピノサウルスの背中の大きな帆と細長いワニのような頭、長い尻尾をシンプルでかわいく描く。背中の帆は輪郭線のみで模様は入れない。",
        "variants": {
            1: {
                "scenes": {
                    "simple": "かわいいスピノサウルスの塗り絵。スピノサウルス1匹のみ・横向きで立つ姿・背景なし・余白たっぷり。背中の大きな帆がよくわかる構図。",
                    "easy":   "かわいいスピノサウルスの塗り絵。スピノサウルスが川辺で魚を探している構図。水と岸辺つき。",
                    "normal": "かわいいスピノサウルスの塗り絵。親子のスピノサウルスが水辺でくつろいでいる構図。川と植物が点在。",
                    "rich":   "かわいいスピノサウルスの塗り絵。スピノサウルスの家族が古代の川辺で過ごすにぎやかな構図。川・魚・シダ・空が点在。",
                },
                "titles": {
                    "simple": "かわいいスピノサウルス",
                    "easy":   "かわのスピノサウルス",
                    "normal": "スピノサウルスのおやこ",
                    "rich":   "スピノサウルスのかぞく",
                },
                "descs": {
                    "simple": "シンプルなスピノサウルスの線画。背中の大きな帆が特徴。",
                    "easy":   "川辺で魚を探すスピノサウルスの線画。水と岸辺つき。",
                    "normal": "水辺でくつろぐ親子スピノサウルスの線画。",
                    "rich":   "古代の川辺で過ごすスピノサウルス家族のにぎやかな線画。魚つき。",
                },
            },
        },
    },
    "tyrannosaurus": {
        "jp": "ティラノサウルス",
        "note": "ティラノサウルスの大きな頭と鋭い歯、小さな前足、太い後ろ足と長い尻尾をシンプルでかわいく描く。歯は鋭くしすぎず、子ども向けに親しみやすい表情にする。",
        "variants": {
            1: {
                "scenes": {
                    "simple": "かわいいティラノサウルスの塗り絵。ティラノサウルス1匹のみ・横向きで立つ姿・背景なし・余白たっぷり。",
                    "easy":   "かわいいティラノサウルスの塗り絵。ティラノサウルスが原始の森を歩いている構図。シダ植物の背景つき。",
                    "normal": "かわいいティラノサウルスの塗り絵。親子のティラノサウルスが森でくつろいでいる構図。木とシダが点在。",
                    "rich":   "かわいいティラノサウルスの塗り絵。ティラノサウルスの家族が太古の森で過ごすにぎやかな構図。火山・木・シダ・小さな恐竜が点在。",
                },
                "titles": {
                    "simple": "かわいいティラノサウルス",
                    "easy":   "もりのティラノサウルス",
                    "normal": "ティラノサウルスのおやこ",
                    "rich":   "ティラノサウルスのかぞく",
                },
                "descs": {
                    "simple": "シンプルなティラノサウルスの線画。大きな頭と小さな前足がわかりやすい。",
                    "easy":   "原始の森を歩くティラノサウルスの線画。シダ植物つき。",
                    "normal": "森でくつろぐ親子ティラノサウルスの線画。",
                    "rich":   "太古の森で過ごすティラノサウルス家族のにぎやかな線画。火山と小さな恐竜つき。",
                },
            },
        },
    },
}

# =========================================================
# ユーティリティ
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


def add_to_data_ts(entries, supabase_urls, theme_id):
    """entries: list of (file_id, title, desc, age_min, age_max, diff, dur, tools)
       supabase_urls: {file_id: url}"""
    content = DATA_TS.read_text()
    if f"id: '{entries[0][0]}'" in content:
        log(f"  data.ts に既存: {entries[0][0]} — スキップ")
        return False

    block = ""
    for file_id, title, desc, age_min, age_max, diff, dur, tools in entries:
        url = supabase_urls[file_id]
        block += f"""  {{
    id: '{file_id}',
    title: '{title}',
    description: '{desc}',
    ageMin: {age_min}, ageMax: {age_max}, difficulty: {diff}, duration: {dur},
    category: 'coloring', theme: 'dinosaurs',
    tags: ['{theme_id}', 'きょうりゅう', 'ぬりえ'],
    tools: ['{tools}'],
    activityIdeas: [
      '好きな色で塗ってみよう',
      '背景もカラフルに仕上げよう',
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
    log(f"  data.ts 更新完了")
    return True


def git_commit_push(theme_id, variant):
    subprocess.run(["git", "add", "src/lib/data.ts"], cwd=REPO_DIR, check=True)
    msg = f"Add {theme_id}-{variant} dinosaur theme"
    subprocess.run(["git", "commit", "-m", msg], cwd=REPO_DIR, check=True)
    subprocess.run(["git", "push", "origin", "main"], cwd=REPO_DIR, check=True)
    log(f"  push 完了: {theme_id}-{variant}")


# =========================================================
# ChatGPT 操作
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
    """画像生成完了 or エラーを検出。
    Returns: ('ok', src) | ('error', None) | ('timeout', None)
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        imgs = page.query_selector_all("img")
        for img in imgs:
            src = img.get_attribute("src") or ""
            if "backend-api/estuary/content" in src or "oaiusercontent" in src:
                return ('ok', src)
        # エラーメッセージ検知
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
    """背景近白(>=threshold)を純白#FFFFFFに統一"""
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
        # 背景純白化（必須）
        whiten_background(out_path)
        return True
    return False


def delete_current_chat(page):
    """現在開いているチャットを削除（is_visible: false）"""
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
    """macOS通知センターに通知を送る"""
    try:
        subprocess.run([
            "osascript", "-e",
            f'display notification "{msg}" with title "{title}"'
        ], check=False)
    except Exception:
        pass


def restart_chrome(pw):
    """ChromeをKill→再起動→CDP再接続。新しい browser を返す。"""
    log("  [復旧] Chromeを再起動中...")
    subprocess.run(["pkill", "-f", "remote-debugging-port=9222"], check=False)
    time.sleep(3)
    subprocess.Popen(CHROME_CMD, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(8)  # 起動待ち
    for attempt in range(3):
        try:
            browser = pw.chromium.connect_over_cdp("http://localhost:9222")
            log("  [復旧] Chrome再接続成功")
            return browser
        except Exception as e:
            log(f"  [復旧] 再接続失敗 ({attempt+1}/3): {e}")
            time.sleep(5)
    log("  [復旧] Chrome再接続できず。処理続行不可。")
    return None


def generate_with_recovery(pw, state, file_id, prompt, out_path):
    """generate_one の呼び出しをリトライ消耗後の3段回復でラップ"""
    # 通常3リトライ
    if generate_one(state['page'], file_id, prompt, out_path):
        return True

    # ① 60秒クールダウン後に再試行
    log(f"  [復旧①] 60秒クールダウン後に再試行: {file_id}")
    time.sleep(60)
    if generate_one(state['page'], file_id, prompt, out_path, max_retries=1):
        return True

    # ② ブラウザ再起動後に再試行
    log(f"  [復旧②] ブラウザ再起動後に再試行: {file_id}")
    new_browser = restart_chrome(pw)
    if new_browser is not None:
        state['browser'] = new_browser
        state['page'] = new_browser.contexts[0].new_page()
        if generate_one(state['page'], file_id, prompt, out_path, max_retries=1):
            return True

    # ③ スキップ + ログ + 通知
    log(f"  [復旧③] スキップして次へ: {file_id}")
    with open(FAILED_LOG, "a") as f:
        f.write(f"{time.strftime('%Y-%m-%dT%H:%M:%S')} {file_id}\n")
    notify_mac("ぬりえ生成失敗", f"{file_id} を3段回復後もスキップしました")
    return False


def run_variant(pw, state, theme_id, variant, client):  # noqa: E501
    dino = DINOSAURS[theme_id]
    jp = dino["jp"]
    note = dino["note"]
    vdata = dino["variants"][variant]
    log(f"\n{'='*50}\nテーマ開始: {theme_id}-{variant} ({jp})")

    specs = make_specs(theme_id, jp, variant, vdata["scenes"])
    entries = make_entries(theme_id, jp, variant, vdata["titles"], vdata["descs"])

    supabase_urls = {}
    for file_id, description in specs:
        prompt = f"{description}\n{note}\n{COMMON_CONDITIONS}"
        local_path = TMP_DIR / f"{file_id}-illust.png"
        ok = generate_with_recovery(pw, state, file_id, prompt, local_path)
        if not ok:
            log(f"  失敗（スキップ）: {file_id}")
            continue
        try:
            url = upload_to_supabase(client, local_path, f"{file_id}-illust.png")
            supabase_urls[file_id] = url
            log(f"  Supabaseアップ完了: {url}")
        except Exception as e:
            log(f"  Supabaseアップ失敗: {file_id} — {e}")
        time.sleep(5)

    if supabase_urls:
        if add_to_data_ts(entries, supabase_urls, theme_id):
            git_commit_push(theme_id, variant)
    log(f"完了: {theme_id}-{variant} ({len(supabase_urls)}/4枚)")
    return len(supabase_urls)


# =========================================================
# メイン
# =========================================================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--theme", default="tyrannosaurus", help="恐竜ID")
    parser.add_argument("--variant", type=int, default=1, help="バリエーション番号")
    parser.add_argument("--all", action="store_true", help="全恐竜・全variant")
    args = parser.parse_args()

    if args.theme not in DINOSAURS:
        log(f"ERROR: {args.theme} の定義がない")
        sys.exit(1)

    client = supabase_client()

    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp("http://localhost:9222")
        except Exception as e:
            log(f"ERROR: Chrome CDP接続失敗。Chromeを以下で起動してください:")
            log(f'  /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.chatgpt-chrome-profile"')
            sys.exit(1)

        context = browser.contexts[0]
        page = context.new_page()
        state = {'browser': browser, 'page': page}

        if args.all:
            for tid, dino in DINOSAURS.items():
                for v in dino["variants"]:
                    run_variant(p, state, tid, v, client)
                    time.sleep(10)
        else:
            run_variant(p, state, args.theme, args.variant, client)

        state['browser'].close()
        log("\n全処理完了")


if __name__ == "__main__":
    main()
