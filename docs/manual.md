# ぬりえプリント 生成マニュアル

## 環境セットアップ（初回のみ）

### 1. リポジトリのクローン
git clone https://github.com/Daiki-Morishita/hoiku-print.git
cd hoiku-print

### 2. Python依存インストール
pip install playwright supabase pillow numpy
playwright install chromium

### 3. 環境変数の設定
export SUPABASE_URL=https://hdhogsjmdowevijxooiq.supabase.co
export SUPABASE_SECRET_KEY=<サービスロールキー>
※ キーは別途共有する

### 4. ChromeをCDPモードで起動
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.chatgpt-chrome-profile"

- 初回のみ: 起動したChromeで https://chatgpt.com にログイン
- 2回目以降: プロファイルが保存されているので自動でログイン済み状態になる
- Chromeはスクリプト実行中ずっと起動したままにする

---

## 恐竜テーマ（dinosaurs）

### 実行
python3 scripts/generate_dinosaur.py --theme tyrannosaurus --variant 1
python3 scripts/generate_dinosaur.py --all

### 恐竜リスト（計17種）
肉食: tyrannosaurus, spinosaurus, velociraptor, allosaurus, giganotosaurus, therizinosaurus
草食: triceratops, stegosaurus, brachiosaurus, ankylosaurus, parasaurolophus, pachycephalosaurus
翼竜・海竜: pteranodon, mosasaurus, plesiosaurus
古代哺乳類: mammoth, smilodon

---

## 公園テーマ（park）

### 実行
python3 scripts/generate_park.py --item swing --variant 1
python3 scripts/generate_park.py --all

### アイテムリスト（計15種）
swing, baby-swing, tire-swing, slide, spiral-slide, tunnel-slide,
seesaw, sandbox, jungle-gym, horizontal-bar, merry-go-round,
spring-rider, balance-beam, climbing-wall, water-play

### レート制限対策
アイテム間に60秒のウェイトを入れている。
それでも「リクエストが多すぎます」が出た場合は generate_park.py の
time.sleep(60) を長くする（120秒→180秒と段階的に増やす）。

---

## 季節の行事テーマ（seasonal-events）

### 実行
```bash
python3 scripts/batch_seasonal_events.py --item hinamatsuri --variant 1
python3 scripts/batch_seasonal_events.py --all --variant 1   # 1巡目
python3 scripts/batch_seasonal_events.py --all --variant 2   # 2巡目（別場面）
python3 scripts/batch_seasonal_events.py --all --variant 3   # 3巡目（別場面）
```

### アイテムリスト（計21種）
- **春**: hinamatsuri, enrollment, childrensday, mothersday, excursion
- **夏**: fathersday, tanabata, pool, summerfestival
- **秋**: tsukimi, sports, imohori, halloween, shichigosan
- **冬**: christmas, mochitsuki, newyear, setsubun
- **通年**: graduation, birthday

### バリアントの違い（-1/-2/-3）
同じアイテム・同じユニットで構図・登場要素を変えた別バージョン。
3バリアントで1アイテムを多角的にカバーする。

### レート制限対策
アイテム間60秒ウェイト（generate_park.py と同じ設定）。
引っかかった場合は time.sleep の値を 120/180 と段階的に増やす。

---

## 共通仕様

### スクリプトが自動でやること
1. ChatGPT にプロンプトを送信（ユニットごとに新規チャット）
2. 画像生成完了 or エラーを検知（最大4分待機）
3. 画像を tmp_materials/{file_id}-illust.png に一時保存
4. 背景を純白 #FFFFFF に補正（PIL処理）
5. Supabase Storage にアップロード
6. ChatGPTのチャットを削除
7. src/lib/data.ts にエントリを追記
8. git commit & push → Vercel が自動デプロイ

### エラー時の自動回復（3段階）
通常: 最大3回リトライ（エラー検知 / タイムアウト / DL失敗）
①: 3回全滅 → 60秒待機 → 1回再試行
②: それでも失敗 → Chrome再起動 → CDP再接続 → 1回再試行
③: それでも失敗 → スキップ・failed_ids.txt 記録・macOS通知 → 次へ

### ログの確認
tail -f scripts/generate_dinosaur.log
tail -f scripts/generate_park.log

### 命名規則
{アイテムID}-{難易度}-{バリアント番号}
例: swing-simple-1 / tyrannosaurus-rich-2

難易度:
- simple: 2〜3歳 / 1つのみ・背景なし
- easy:   3歳   / シンプルな背景つき
- normal: 4〜5歳 / 複数・場所がわかる背景
- rich:   4〜6歳 / にぎやかな背景

### 並列生成（複数環境）
- テーマ単位で環境を分担する（同じテーマを複数環境で同時生成しない）
- 各環境で同じセットアップを行い、担当テーマだけ実行する

### 注意事項
- Chrome を閉じるとCDP接続エラーで落ちる
- tmp_materials/ は毎週日曜3時に自動削除される（cron設定済み）
- 新しいアイテムを追加する場合は各スクリプトの辞書にエントリを追記する
- 用語定義は docs/terms.md を参照
