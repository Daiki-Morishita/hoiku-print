#!/usr/bin/env python3
"""
public/materials/ の画像を Supabase Storage に移行するスクリプト
"""
import os, sys, re
from pathlib import Path
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://hdhogsjmdowevijxooiq.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
if not SUPABASE_KEY:
    print("ERROR: 環境変数 SUPABASE_SECRET_KEY を設定してください")
    sys.exit(1)
BUCKET = "materials"
MATERIALS_DIR = Path(__file__).parent.parent / "public" / "materials"
DATA_TS = Path(__file__).parent.parent / "src" / "lib" / "data.ts"

def main():
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # バケット作成（既存ならOK）
    try:
        client.storage.create_bucket(BUCKET, options={"public": True})
        print(f"バケット '{BUCKET}' 作成済み")
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
            print(f"バケット '{BUCKET}' は既存 — 続行")
        else:
            print(f"バケット作成エラー: {e}")

    # 画像ファイル一覧
    png_files = sorted(MATERIALS_DIR.glob("*.png"))
    svg_files = sorted(MATERIALS_DIR.glob("*.svg"))
    all_files = png_files + svg_files
    print(f"\nアップロード対象: {len(all_files)} ファイル")

    # 既存のアップロード済みファイルを取得
    try:
        existing = client.storage.from_(BUCKET).list()
        existing_names = {f["name"] for f in existing}
        print(f"既存アップロード済み: {len(existing_names)} ファイル")
    except Exception as e:
        existing_names = set()
        print(f"既存リスト取得失敗: {e}")

    success = 0
    skip = 0
    fail = 0

    for i, fpath in enumerate(all_files):
        fname = fpath.name
        if fname in existing_names:
            skip += 1
            continue

        try:
            with open(fpath, "rb") as f:
                data = f.read()
            mime = "image/svg+xml" if fname.endswith(".svg") else "image/png"
            client.storage.from_(BUCKET).upload(
                path=fname,
                file=data,
                file_options={"content-type": mime, "upsert": "true"},
            )
            success += 1
            if success % 10 == 0 or i == len(all_files) - 1:
                print(f"  [{i+1}/{len(all_files)}] アップロード済み: {success}件")
        except Exception as e:
            print(f"  失敗: {fname} — {e}")
            fail += 1

    print(f"\n完了: 成功={success}, スキップ={skip}, 失敗={fail}")

    # data.ts の URL を置換
    print("\ndata.ts のURL更新中...")
    content = DATA_TS.read_text()
    base_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"

    # /materials/xxx.png → Supabase URL
    new_content = re.sub(
        r"'/materials/([^']+)'",
        lambda m: f"'{base_url}/{m.group(1)}'",
        content
    )

    changed = content.count("/materials/") - new_content.count("/materials/")
    DATA_TS.write_text(new_content)
    print(f"  URL更新: {content.count('/materials/')} 箇所 → Supabase URL に変更")

    print("\n✅ 移行完了。次のステップ:")
    print("  git add src/lib/data.ts")
    print("  git rm --cached public/materials/*.png public/materials/*.svg (gitから除外)")
    print("  echo 'public/materials/' >> .gitignore")
    print("  git commit && git push")

if __name__ == "__main__":
    main()
