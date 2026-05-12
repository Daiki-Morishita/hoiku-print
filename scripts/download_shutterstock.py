#!/usr/bin/env python3
"""
Shutterstockからコラム用画像をダウンロードするスクリプト

使い方:
  python3 scripts/download_shutterstock.py              # 全画像
  python3 scripts/download_shutterstock.py --id col1-hero  # 単体
  python3 scripts/download_shutterstock.py --list       # 一覧表示

前提:
  - Chrome が --remote-debugging-port=9222 で起動済み
  - Shutterstockにログイン済み（サブスクリプション有効）
  - public/columns/ ディレクトリが存在する

ダウンロード先: public/columns/{id}.jpg
"""

import os, sys, time, re, argparse
from pathlib import Path
from playwright.sync_api import sync_playwright, Page

REPO_DIR = Path(__file__).parent.parent
OUT_DIR = REPO_DIR / "public" / "columns"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# コラム画像定義: id → (query, filename, description)
IMAGES = [
    # benefits-of-coloring-for-kids
    ("col1-hero",  "child coloring drawing happy",                  "col1-hero.jpg",  "ぬりえをする子ども（ヒーロー）"),
    ("col1-sec1",  "child coloring book table concentrated",        "col1-sec1.jpg",  "集中してぬりえに取り組む子ども"),
    ("col1-sec2",  "child painting creative art expression happy",  "col1-sec2.jpg",  "創造的な絵描き・感情表現"),

    # coloring-by-age-guide
    ("col2-hero",  "children different ages drawing coloring together", "col2-hero.jpg", "年齢別ぬりえ（ヒーロー）"),
    ("col2-sec1",  "three year old child coloring crayon",              "col2-sec1.jpg", "3歳児がクレヨンでぬりえ"),

    # pen-control-practice-guide
    ("col3-hero",  "child learning write pencil tracing paper",   "col3-hero.jpg", "鉛筆で練習する子ども（ヒーロー）"),
    ("col3-sec1",  "child correct pencil grip holding pencil",    "col3-sec1.jpg", "正しい鉛筆の持ち方"),

    # scissors-practice-for-kids
    ("col4-hero",  "child using scissors craft paper cutting",        "col4-hero.jpg", "ハサミを使う子ども（ヒーロー）"),
    ("col4-sec1",  "child cutting paper scissors craft step",         "col4-sec1.jpg", "ハサミで紙を切る子ども"),

    # rainy-day-indoor-activities
    ("col5-hero",  "rainy day children indoor playing crafts cozy",   "col5-hero.jpg", "雨の日の室内遊び（ヒーロー）"),
    ("col5-sec1",  "cozy indoor children playing rainy window",       "col5-sec1.jpg", "雨の日に室内で遊ぶ子ども"),

    # seasonal-crafts-for-nursery
    ("col6-hero",  "kindergarten seasonal craft decoration holiday children", "col6-hero.jpg", "季節の制作（ヒーロー）"),
    ("col6-sec1",  "nursery school seasonal decoration wall art children",    "col6-sec1.jpg", "保育園の季節飾り"),
]

IMAGES_BY_ID = {img[0]: img for img in IMAGES}


def search_and_get_first_image_url(page: Page, query: str) -> str | None:
    """Shutterstockで検索して最初の画像のURLを返す"""
    encoded = query.replace(" ", "%20")
    url = f"https://www.shutterstock.com/search/{encoded}?image_type=photo&sort=popular"
    print(f"  → 検索: {url}")
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(2)

    # 最初の画像リンクを探す
    links = page.query_selector_all('a[data-automation="search-grid-item"]')
    if not links:
        # フォールバック: imgタグ経由
        links = page.query_selector_all('.MuiImageListItem-root a, [class*="SearchResultCard"] a')
    if not links:
        print("  ✗ 画像リンクが見つからない")
        return None

    href = links[0].get_attribute("href")
    if href and not href.startswith("http"):
        href = "https://www.shutterstock.com" + href
    return href


def download_image(page: Page, detail_url: str, out_path: Path, img_id: str) -> bool:
    """画像詳細ページを開いてダウンロード"""
    print(f"  → 詳細ページ: {detail_url}")

    with page.context.expect_download(timeout=60000) as dl_info:
        page.goto(detail_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2)

        # Download / License ボタンを探す
        download_btn = None
        selectors = [
            'button[data-automation="licenseButton"]',
            'button:has-text("License")',
            'button:has-text("Download")',
            'a:has-text("License")',
            '[data-automation="download-btn"]',
        ]
        for sel in selectors:
            btn = page.query_selector(sel)
            if btn:
                download_btn = btn
                break

        if not download_btn:
            print("  ✗ ダウンロードボタンが見つからない")
            return False

        print(f"  → ボタンクリック: {download_btn.inner_text()[:30]}")
        download_btn.click()

        # ライセンスモーダルが出る場合
        time.sleep(1.5)
        confirm_btn = page.query_selector('button:has-text("License and Download"), button:has-text("Complete Download")')
        if confirm_btn:
            print("  → モーダル確認ボタンをクリック")
            confirm_btn.click()

    dl = dl_info.value
    dl.save_as(str(out_path))
    print(f"  ✓ 保存: {out_path.name} ({out_path.stat().st_size // 1024} KB)")
    return True


def download_via_src(page: Page, query: str, out_path: Path) -> bool:
    """
    フォールバック: 検索ページのプレビュー画像URLから直接取得
    （ライセンス取得は別途。プレビューはウォーターマーク付き）
    """
    encoded = query.replace(" ", "%20")
    url = f"https://www.shutterstock.com/search/{encoded}?image_type=photo&sort=popular"
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(2)

    imgs = page.query_selector_all('img[src*="shutterstock"][src*="600w"]')
    if not imgs:
        imgs = page.query_selector_all('img[data-automation="search-grid-item-image"]')
    if not imgs:
        imgs = page.query_selector_all('.MuiImageListItem-root img')

    if not imgs:
        return False

    src = imgs[0].get_attribute("src")
    if not src:
        return False

    print(f"  → 画像URL: {src[:80]}...")
    page.evaluate(f"""
        const a = document.createElement('a');
        a.href = '{src}';
        a.download = 'shutterstock_dl.jpg';
        document.body.appendChild(a);
        a.click();
    """)
    time.sleep(2)
    return True


def process_image(page: Page, img_id: str, query: str, filename: str, desc: str) -> bool:
    out_path = OUT_DIR / filename

    if out_path.exists():
        print(f"[{img_id}] スキップ（既存）: {filename}")
        return True

    print(f"\n[{img_id}] {desc}")
    print(f"  クエリ: {query}")

    try:
        detail_url = search_and_get_first_image_url(page, query)
        if not detail_url:
            return False

        success = download_image(page, detail_url, out_path, img_id)
        if not success:
            print("  → プレビューフォールバックを試みる")
            success = download_via_src(page, query, out_path)

        return success

    except Exception as e:
        print(f"  ✗ エラー: {e}")
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", help="特定の画像IDのみ（例: col1-hero）")
    parser.add_argument("--list", action="store_true", help="画像一覧を表示して終了")
    args = parser.parse_args()

    if args.list:
        print(f"{'ID':<12} {'ファイル':<16} 説明")
        print("-" * 60)
        for img_id, query, filename, desc in IMAGES:
            exists = "✓" if (OUT_DIR / filename).exists() else " "
            print(f"{exists} {img_id:<12} {filename:<16} {desc}")
        return

    targets = IMAGES
    if args.id:
        if args.id not in IMAGES_BY_ID:
            print(f"ERROR: ID '{args.id}' が見つかりません")
            print("利用可能ID:", [i[0] for i in IMAGES])
            sys.exit(1)
        targets = [IMAGES_BY_ID[args.id]]

    with sync_playwright() as pw:
        print("Chrome CDP に接続中 (localhost:9222)...")
        browser = pw.chromium.connect_over_cdp("http://localhost:9222")
        context = browser.contexts[0]
        page = context.new_page()

        results = {}
        for img_id, query, filename, desc in targets:
            ok = process_image(page, img_id, query, filename, desc)
            results[img_id] = ok
            if len(targets) > 1:
                time.sleep(3)

        page.close()

    print("\n=== 結果 ===")
    ok_count = sum(1 for v in results.values() if v)
    for img_id, ok in results.items():
        print(f"  {'✓' if ok else '✗'} {img_id}")
    print(f"\n{ok_count}/{len(results)} 完了 → {OUT_DIR}")

    if ok_count == len(results):
        print("\ncolumns.ts の heroSrc / src を更新してください:")
        for img_id, query, filename, desc in targets:
            col_num = img_id.split("-")[0]  # col1, col2...
            section = img_id.split("-")[1]  # hero, sec1, sec2
            if section == "hero":
                print(f"  {img_id}: heroSrc: '/columns/{filename}'")
            else:
                print(f"  {img_id}: src: '/columns/{filename}'")


if __name__ == "__main__":
    main()
