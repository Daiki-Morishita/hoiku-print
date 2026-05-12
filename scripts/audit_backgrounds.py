#!/usr/bin/env python3
"""
Supabase Storage の全画像をチェックし、背景がオフホワイトのものをリストアップ
オプションで純白化＆再アップロード

使い方:
  python3 scripts/audit_backgrounds.py           # チェックのみ
  python3 scripts/audit_backgrounds.py --fix     # 問題ファイルを純白化して再アップ
"""
import os, sys, argparse, requests
from io import BytesIO
from pathlib import Path
from PIL import Image
import numpy as np
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://hdhogsjmdowevijxooiq.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
BUCKET = "materials"
THRESHOLD = 235     # この値以上の明度を背景候補とみなす
TOLERANCE = 1       # 純白(255)からどこまでズレを許すか
SAMPLE_PIXELS = 200 # 四隅周辺からサンプリングする画素数

if not SUPABASE_KEY:
    print("ERROR: SUPABASE_SECRET_KEY を環境変数に設定してください", file=sys.stderr)
    sys.exit(1)


def check_background(img_bytes):
    """背景がオフホワイトかチェック。(is_off_white, avg_corner_color) を返す"""
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    arr = np.array(img)
    h, w = arr.shape[:2]
    # 四隅周辺のサンプリング
    corners = np.concatenate([
        arr[:10, :10].reshape(-1, 3),
        arr[:10, -10:].reshape(-1, 3),
        arr[-10:, :10].reshape(-1, 3),
        arr[-10:, -10:].reshape(-1, 3),
    ])
    # 線が来てない明るい画素のみ
    mask = (corners[:, 0] >= THRESHOLD) & (corners[:, 1] >= THRESHOLD) & (corners[:, 2] >= THRESHOLD)
    if mask.sum() < 50:
        return False, None  # 隅に線が入りまくっていて判定困難
    bg_pixels = corners[mask]
    avg = bg_pixels.mean(axis=0)
    is_pure = all(255 - c <= TOLERANCE for c in avg)
    return not is_pure, tuple(int(c) for c in avg)


def whiten(img_bytes):
    """背景純白化したPNGバイト列を返す"""
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    arr = np.array(img)
    mask = (arr[:,:,0] >= THRESHOLD) & (arr[:,:,1] >= THRESHOLD) & (arr[:,:,2] >= THRESHOLD)
    arr[mask] = [255, 255, 255]
    out = BytesIO()
    Image.fromarray(arr).save(out, "PNG", optimize=True)
    return out.getvalue()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fix", action="store_true", help="問題ファイルを純白化して再アップ")
    args = parser.parse_args()

    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    files = client.storage.from_(BUCKET).list(options={"limit": 1000})
    png_files = [f for f in files if f["name"].endswith(".png")]
    print(f"PNG ファイル数: {len(png_files)}")

    base_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"
    issues = []

    for i, f in enumerate(png_files, 1):
        name = f["name"]
        url = f"{base_url}/{name}"
        try:
            r = requests.get(url, timeout=20)
            if r.status_code != 200:
                print(f"[{i:3d}/{len(png_files)}] FETCH FAIL: {name}")
                continue
            is_off, avg = check_background(r.content)
            if is_off:
                issues.append((name, avg, r.content))
                print(f"[{i:3d}/{len(png_files)}] ⚠ {name}  avg={avg}")
            else:
                if i % 20 == 0:
                    print(f"[{i:3d}/{len(png_files)}] OK ({len(issues)}件問題)")
        except Exception as e:
            print(f"[{i:3d}/{len(png_files)}] ERROR {name}: {e}")

    print(f"\n=== 問題ファイル: {len(issues)} 件 ===")
    for name, avg, _ in issues:
        print(f"  {name}  avg=R{avg[0]} G{avg[1]} B{avg[2]}")

    # ID リストをファイルに出力
    if issues:
        report = Path(__file__).parent / "audit_report.txt"
        with open(report, "w") as f:
            for name, avg, _ in issues:
                fid = name.replace("-illust.png", "")
                f.write(f"{fid}\t{name}\tavg={avg}\n")
        print(f"\nレポート出力: {report}")

    # 修正モード
    if args.fix and issues:
        print(f"\n--fix モード: {len(issues)} 件を純白化して再アップロード")
        for i, (name, avg, content) in enumerate(issues, 1):
            try:
                fixed = whiten(content)
                client.storage.from_(BUCKET).upload(
                    path=name,
                    file=fixed,
                    file_options={"content-type": "image/png", "upsert": "true"},
                )
                print(f"  [{i}/{len(issues)}] ✓ {name}")
            except Exception as e:
                print(f"  [{i}/{len(issues)}] FAIL {name}: {e}")


if __name__ == "__main__":
    main()
