#!/usr/bin/env python3
"""
動作確認用: 既存のChromeプロファイルを使ってChatGPTを開く
Chromeを完全に終了してから実行すること（Cmd+Q）
"""
from playwright.sync_api import sync_playwright
import os

CHROME_PROFILE = os.path.expanduser("~/Library/Application Support/Google/Chrome")

def main():
    print("Chromeが完全に終了していることを確認してください（Cmd+Q）")
    input("準備できたらEnterを押してください: ")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=CHROME_PROFILE,
            channel="chrome",
            headless=False,
            slow_mo=50,
            viewport={"width": 1280, "height": 900},
        )
        page = context.new_page()
        page.goto("https://chatgpt.com/")
        print("ChatGPTが開きました。正常にログイン状態になっていれば成功です。")
        input("確認できたらEnterを押してください（ブラウザが閉じます）: ")
        context.close()

if __name__ == "__main__":
    main()
