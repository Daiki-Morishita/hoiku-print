/**
 * generate-materials.mjs
 *
 * ぬりえ素材を自動生成するスクリプト
 *
 * 使い方:
 *   node scripts/generate-materials.mjs [--count 10] [--theme "ねこ,いぬ,うさぎ"]
 *
 * 処理フロー:
 *   1. テーマリストから未生成のものを選ぶ
 *   2. DALL-E 3 で線画生成
 *   3. Claude Vision でメタデータ自動生成
 *   4. public/materials/ に保存
 *   5. data.ts に追記するスニペットを output/ に出力
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// ── 環境変数読み込み ──────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.+)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}
loadEnv()

const OPENAI_KEY    = process.env.OPENAI_API_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!OPENAI_KEY)    { console.error('❌ OPENAI_API_KEY が未設定'); process.exit(1) }
if (!ANTHROPIC_KEY) { console.error('❌ ANTHROPIC_API_KEY が未設定'); process.exit(1) }

// ── テーマリスト ──────────────────────────────────────────────────────────

const ALL_THEMES = [
  // 動物（陸）
  { theme: 'ねこ',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'いぬ',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'うさぎ',       category: 'coloring', animalTheme: 'animals' },
  { theme: 'くま',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'ぞう',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'きりん',       category: 'coloring', animalTheme: 'animals' },
  { theme: 'ライオン',     category: 'coloring', animalTheme: 'animals' },
  { theme: 'パンダ',       category: 'coloring', animalTheme: 'animals' },
  { theme: 'ぶた',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'うし',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'うま',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'さる',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'りす',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'たぬき',       category: 'coloring', animalTheme: 'animals' },
  { theme: 'きつね',       category: 'coloring', animalTheme: 'animals' },
  { theme: 'かえる',       category: 'coloring', animalTheme: 'animals' },
  { theme: 'カメ',         category: 'coloring', animalTheme: 'animals' },
  { theme: 'ハムスター',   category: 'coloring', animalTheme: 'animals' },
  // 動物（海・川）
  { theme: 'さかな',       category: 'coloring', animalTheme: 'sea' },
  { theme: 'タコ',         category: 'coloring', animalTheme: 'sea' },
  { theme: 'クラゲ',       category: 'coloring', animalTheme: 'sea' },
  { theme: 'カニ',         category: 'coloring', animalTheme: 'sea' },
  { theme: 'ペンギン',     category: 'coloring', animalTheme: 'sea' },
  { theme: 'イルカ',       category: 'coloring', animalTheme: 'sea' },
  { theme: 'クジラ',       category: 'coloring', animalTheme: 'sea' },
  { theme: 'ウミガメ',     category: 'coloring', animalTheme: 'sea' },
  // 虫・鳥
  { theme: 'ちょうちょ',   category: 'coloring', animalTheme: 'insects' },
  { theme: 'てんとうむし', category: 'coloring', animalTheme: 'insects' },
  { theme: 'カブトムシ',   category: 'coloring', animalTheme: 'insects' },
  { theme: 'クワガタ',     category: 'coloring', animalTheme: 'insects' },
  { theme: 'ほたる',       category: 'coloring', animalTheme: 'insects' },
  // 恐竜
  { theme: 'トリケラトプス',   category: 'coloring', animalTheme: 'dinosaurs' },
  { theme: 'ブラキオサウルス', category: 'coloring', animalTheme: 'dinosaurs' },
  { theme: 'プテラノドン',     category: 'coloring', animalTheme: 'dinosaurs' },
  { theme: 'ステゴサウルス',   category: 'coloring', animalTheme: 'dinosaurs' },
  // のりもの
  { theme: 'パトカー',     category: 'coloring', animalTheme: 'vehicles' },
  { theme: '救急車',       category: 'coloring', animalTheme: 'vehicles' },
  { theme: '消防車',       category: 'coloring', animalTheme: 'vehicles' },
  { theme: 'バス',         category: 'coloring', animalTheme: 'vehicles' },
  { theme: '新幹線',       category: 'coloring', animalTheme: 'trains' },
  { theme: '飛行機',       category: 'coloring', animalTheme: 'vehicles' },
  { theme: 'ショベルカー', category: 'coloring', animalTheme: 'vehicles' },
  { theme: 'ロケット',     category: 'coloring', animalTheme: 'vehicles' },
  // 食べ物（果物）
  { theme: 'いちご',       category: 'coloring', animalTheme: 'food' },
  { theme: 'バナナ',       category: 'coloring', animalTheme: 'food' },
  { theme: 'ぶどう',       category: 'coloring', animalTheme: 'food' },
  { theme: 'すいか',       category: 'coloring', animalTheme: 'food' },
  { theme: 'みかん',       category: 'coloring', animalTheme: 'food' },
  { theme: 'さくらんぼ',   category: 'coloring', animalTheme: 'food' },
  // 食べ物（野菜・おやつ）
  { theme: 'にんじん',     category: 'coloring', animalTheme: 'food' },
  { theme: 'とうもろこし', category: 'coloring', animalTheme: 'food' },
  { theme: 'かぼちゃ',     category: 'coloring', animalTheme: 'food' },
  { theme: 'ケーキ',       category: 'coloring', animalTheme: 'food' },
  { theme: 'アイスクリーム', category: 'coloring', animalTheme: 'food' },
  { theme: 'おにぎり',     category: 'coloring', animalTheme: 'food' },
  // 季節行事
  { theme: 'こいのぼり',   category: 'coloring', animalTheme: null, season: 'spring', event: 'kodomo' },
  { theme: 'かぶと（兜）', category: 'coloring', animalTheme: null, season: 'spring', event: 'kodomo' },
  { theme: 'ひなにんぎょう', category: 'coloring', animalTheme: null, season: 'spring', event: 'hinamatsuri' },
  { theme: 'だるま',       category: 'coloring', animalTheme: null },
  { theme: '夏祭りうちわ', category: 'coloring', animalTheme: null, season: 'summer', event: 'summerfestival' },
  { theme: 'きんぎょすくい', category: 'coloring', animalTheme: null, season: 'summer', event: 'summerfestival' },
  { theme: 'おつきみ',     category: 'coloring', animalTheme: null, season: 'autumn' },
  { theme: 'ハロウィンかぼちゃ', category: 'coloring', animalTheme: null, season: 'autumn', event: 'halloween' },
  { theme: 'クリスマスツリー', category: 'coloring', animalTheme: null, season: 'winter', event: 'christmas' },
  { theme: 'サンタクロース', category: 'coloring', animalTheme: null, season: 'winter', event: 'christmas' },
  // 花・自然
  { theme: 'チューリップ', category: 'coloring', animalTheme: 'flowers', season: 'spring' },
  { theme: 'ひまわり',     category: 'coloring', animalTheme: 'flowers', season: 'summer' },
  { theme: 'あじさい',     category: 'coloring', animalTheme: 'flowers', season: 'summer' },
  { theme: 'たんぽぽ',     category: 'coloring', animalTheme: 'flowers', season: 'spring' },
  { theme: 'さくら',       category: 'coloring', animalTheme: 'flowers', season: 'spring' },
  // ファンタジー
  { theme: 'ドラゴン',     category: 'coloring', animalTheme: null },
  { theme: 'ユニコーン',   category: 'coloring', animalTheme: null },
  { theme: 'おひめさま',   category: 'coloring', animalTheme: null },
  { theme: 'ロボット',     category: 'coloring', animalTheme: null },
]

// ── 引数解析 ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const countArg = args.indexOf('--count')
const COUNT = countArg !== -1 ? parseInt(args[countArg + 1]) : 10

const themeArg = args.indexOf('--theme')
let targets
if (themeArg !== -1) {
  const names = args[themeArg + 1].split(',').map(s => s.trim())
  targets = ALL_THEMES.filter(t => names.includes(t.theme))
} else {
  // 既存素材と重複しないものを選ぶ
  const existingIds = getExistingIds()
  targets = ALL_THEMES
    .filter(t => !existingIds.has(themeToId(t.theme)))
    .slice(0, COUNT)
}

if (targets.length === 0) {
  console.log('✅ 生成対象がありません（すべて生成済みか、テーマが見つかりません）')
  process.exit(0)
}

console.log(`\n🎨 ${targets.length}件を生成します:\n`)
targets.forEach((t, i) => console.log(`  ${i + 1}. ${t.theme}`))
console.log()

// ── バリエーション定義 ───────────────────────────────────────────────────

const VARIANTS = [
  {
    key:    'simple',
    suffix: 'キャラクター1体のみ。背景なし。余白たっぷり。',
    ageMin: 2, ageMax: 3,
  },
  {
    key:    'easy',
    suffix: 'メインキャラ1体＋関連する要素をちょうど1つだけ追加（例：いぬ＋犬小屋のみ）。シンプルな構図。',
    ageMin: 3, ageMax: 3,
  },
  {
    key:    'normal',
    suffix: 'メインキャラ1体＋関連する小物や要素を2〜3つ追加（例：いぬ＋犬小屋＋骨＋ボール）。',
    ageMin: 3, ageMax: 4,
  },
  {
    key:    'rich',
    suffix: '複数のキャラクターと背景・要素を含むにぎやかな構図。ただし要素を詰め込みすぎず、スッキリ見やすい密度にすること。',
    ageMin: 4, ageMax: 6,
  },
]

// ── メイン処理 ────────────────────────────────────────────────────────────

const outputDir = path.join(ROOT, 'scripts', 'output')
fs.mkdirSync(outputDir, { recursive: true })

const snippets = []
let total = 0

for (let i = 0; i < targets.length; i++) {
  const t = targets[i]
  console.log(`\n[${i + 1}/${targets.length}] ${t.theme}`)

  for (const v of VARIANTS) {
    total++
    console.log(`  → ${v.key} を生成中...`)

    try {
      const imageUrl    = await generateImage(t.theme, v.suffix)
      const baseId      = `${themeToId(t.theme)}-${v.key}`
      const num         = getNextNumber(baseId)
      const id          = `${baseId}-${num}`
      const filename    = `${baseId}-illust.png`
      const savePath    = path.join(ROOT, 'public', 'materials', filename)
      const imageBuffer = Buffer.from(imageUrl.b64, 'base64')
      fs.writeFileSync(savePath, imageBuffer)
      console.log(`    ✅ 保存: public/materials/${filename}`)

      const meta = await analyzeWithClaude(imageBuffer, t, v)
      meta.id    = id
      console.log(`    ✅ メタデータ: ${meta.title} (${meta.ageMin}〜${meta.ageMax}歳)`)

      snippets.push(buildSnippet(meta, `/materials/${filename}`))
      await sleep(1500)

    } catch (err) {
      console.error(`    ❌ エラー: ${err.message}`)
    }
  }
}

// 5. スニペットをファイルに出力
const outputPath = path.join(outputDir, `snippets-${Date.now()}.txt`)
fs.writeFileSync(outputPath, snippets.join('\n\n'), 'utf8')

// 6. コスト計算・帳簿記録
const successCount = snippets.length
// chatgpt-image-latest 1536x1024 high: $0.08/枚
// Claude Vision (Opus 4.7): 約$0.02/枚
const costPerImage = 0.08 + 0.02
const totalCost    = successCount * costPerImage
appendLedger(targets.map(t => t.theme).join(','), successCount, totalCost)

console.log(`\n✅ 完了！`)
console.log(`📄 スニペット出力: ${outputPath}`)
console.log(`💰 今回のコスト: $${totalCost.toFixed(2)} (${successCount}枚 × $${costPerImage})`)
console.log(`\n次のステップ: スニペットを src/lib/data.ts の materials 配列に追記してください\n`)

// ── 帳簿記録 ─────────────────────────────────────────────────────────────

function appendLedger(theme, count, cost) {
  const ledgerPath = path.join(ROOT, 'scripts', 'cost-ledger.md')
  const date = new Date().toISOString().replace('T', ' ').slice(0, 16)
  const line = `| ${date} | ${theme} | ${count}枚 | $${cost.toFixed(2)} |\n`

  if (!fs.existsSync(ledgerPath)) {
    fs.writeFileSync(ledgerPath,
      '# 生成コスト帳簿\n\n' +
      '| 日時 | テーマ | 枚数 | コスト |\n' +
      '|---|---|---|---|\n'
    )
  }

  // 合計行を除いて追記
  let content = fs.readFileSync(ledgerPath, 'utf8').replace(/^\*\*合計.+\n/m, '')
  content += line

  // 合計計算
  const costs = [...content.matchAll(/\|\s*\$([0-9.]+)\s*\|/g)].map(m => parseFloat(m[1]))
  const total  = costs.reduce((a, b) => a + b, 0)
  content += `\n**合計: $${total.toFixed(2)}**\n`

  fs.writeFileSync(ledgerPath, content)
}

// ── DALL-E 3 画像生成 ─────────────────────────────────────────────────────

async function generateImage(theme, variantSuffix = '') {
  const prompt = `日本の保育園で使う幼児向けのかわいい「${theme}」の塗り絵。${variantSuffix}白背景。太い輪郭線。A4で高画質に印刷できるできるだけ大きなサイズ。横長。`

  const body = JSON.stringify({
    model:           'chatgpt-image-latest',
    prompt,
    n:               1,
    size:            '1536x1024',
    quality:         'high',
    output_format:   'png',
  })

  const data = await openaiRequest('/v1/images/generations', body)
  // gpt-image-1 は b64_json で返す
  return { b64: data.data[0].b64_json }
}

// ── Claude Vision メタデータ生成 ─────────────────────────────────────────

async function analyzeWithClaude(imageBuffer, themeInfo, variant) {
  const base64 = imageBuffer.toString('base64')

  const systemPrompt = `あなたは保育園・幼稚園向け教材コンテンツ管理システムです。
画像を分析して以下のJSONスキーマで返してください（JSONのみ、説明不要）:
{
  "id": "kebab-case英語ID",
  "title": "日本語タイトル",
  "description": "説明文（80字以内）",
  "category": "coloring",
  "theme": "animals|dinosaurs|vehicles|trains|food|sea|insects|flowers|characters（該当なければnull）",
  "ageMin": 2〜6,
  "ageMax": 2〜6,
  "difficulty": 1か2か3,
  "duration": 5か10か15か20か30,
  "tags": ["タグ"],
  "season": "spring|summer|autumn|winter（なければnull）",
  "event": "tanabata|setsubun|summerfestival|halloween|christmas|hinamatsuri|sports|graduation|mothers|fathers（なければnull）",
  "tools": ["クレヨン"],
  "activityIdeas": ["アイデア1","アイデア2"]
}

年齢判定の基準（厳守）:
- キャラクター1匹・線がシンプル・塗る面積が大きい → ageMin:2 ageMax:4
- 複数キャラクター・背景あり・細かいパーツがある → ageMin:4 ageMax:6
- 非常に細かい・複雑な模様 → ageMin:5 ageMax:6
difficulty も同様: シンプル=1、普通=2、細かい=3`

  const body = JSON.stringify({
    model:      'claude-opus-4-7',
    max_tokens: 1024,
    system:     systemPrompt,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64 } },
        { type: 'text',  text: `この「${themeInfo.theme}」の子ども向けぬりえ画像のメタデータをJSONで返してください。なお、このイラストは${variant.ageMin}〜${variant.ageMax}歳向けに作られたものです。ageMin=${variant.ageMin}、ageMax=${variant.ageMax}で設定してください。` },
      ],
    }],
  })

  const data = await anthropicRequest('/v1/messages', body)
  const text = data.content.find(b => b.type === 'text')?.text ?? ''
  return JSON.parse(text.trim())
}

// ── ユーティリティ ────────────────────────────────────────────────────────

function themeToId(theme) {
  const map = {
    'ねこ':'cat','いぬ':'dog','うさぎ':'rabbit','くま':'bear','ぞう':'elephant',
    'きりん':'giraffe','ライオン':'lion','パンダ':'panda','ぶた':'pig','うし':'cow',
    'うま':'horse','さる':'monkey','りす':'squirrel','たぬき':'raccoon','きつね':'fox',
    'かえる':'frog','カメ':'turtle','ハムスター':'hamster','さかな':'fish','タコ':'octopus',
    'クラゲ':'jellyfish','カニ':'crab','ペンギン':'penguin','イルカ':'dolphin',
    'クジラ':'whale','ウミガメ':'sea-turtle','ちょうちょ':'butterfly',
    'てんとうむし':'ladybug','カブトムシ':'beetle','クワガタ':'stag-beetle',
    'ほたる':'firefly','トリケラトプス':'triceratops','ブラキオサウルス':'brachiosaurus',
    'プテラノドン':'pteranodon','ステゴサウルス':'stegosaurus','パトカー':'police-car',
    '救急車':'ambulance','消防車':'fire-truck','バス':'bus','新幹線':'shinkansen',
    '飛行機':'airplane','ショベルカー':'excavator','ロケット':'rocket',
    'いちご':'strawberry','バナナ':'banana','ぶどう':'grapes','すいか':'watermelon',
    'みかん':'mandarin','さくらんぼ':'cherry','にんじん':'carrot',
    'とうもろこし':'corn','かぼちゃ':'pumpkin','ケーキ':'cake',
    'アイスクリーム':'ice-cream','おにぎり':'onigiri','こいのぼり':'koinobori',
    'かぶと（兜）':'kabuto','ひなにんぎょう':'hinadoll','だるま':'daruma',
    '夏祭りうちわ':'summer-fan','きんぎょすくい':'goldfish-scooping',
    'おつきみ':'moon-viewing','ハロウィンかぼちゃ':'halloween-pumpkin',
    'クリスマスツリー':'christmas-tree','サンタクロース':'santa',
    'チューリップ':'tulip','ひまわり':'sunflower','あじさい':'hydrangea',
    'たんぽぽ':'dandelion','さくら':'cherry-blossom','ドラゴン':'dragon',
    'ユニコーン':'unicorn','おひめさま':'princess','ロボット':'robot',
  }
  return map[theme] ?? theme.replace(/[^\w]/g, '-').toLowerCase()
}

function getExistingIds() {
  const dataPath = path.join(ROOT, 'src', 'lib', 'data.ts')
  const content  = fs.readFileSync(dataPath, 'utf8')
  const ids = new Set()
  for (const m of content.matchAll(/id:\s*['"]([^'"]+)['"]/g)) ids.add(m[1])
  return ids
}

// baseId（例: bear-simple）に対して次の番号を返す
function getNextNumber(baseId) {
  const existing = getExistingIds()
  let n = 1
  while (existing.has(`${baseId}-${n}`)) n++
  return n
}

function buildSnippet(meta, illustUrl) {
  const lines = [
    `  {`,
    `    id: '${meta.id}',`,
    `    title: '${meta.title}',`,
    `    description: '${meta.description}',`,
    `    ageMin: ${meta.ageMin},`,
    `    ageMax: ${meta.ageMax},`,
    `    difficulty: ${meta.difficulty},`,
    `    duration: ${meta.duration},`,
    `    category: '${meta.category}',`,
    meta.theme  ? `    theme: '${meta.theme}',`  : null,
    `    tags: [${meta.tags.map(t=>`'${t}'`).join(', ')}],`,
    meta.season ? `    season: '${meta.season}',` : null,
    meta.event  ? `    event: '${meta.event}',`   : null,
    `    tools: [${meta.tools.map(t=>`'${t}'`).join(', ')}],`,
    `    activityIdeas: [`,
    ...meta.activityIdeas.map(a=>`      '${a}',`),
    `    ],`,
    `    imageUrl: '${illustUrl}',`,
    `    illustUrl: '${illustUrl}',`,
    `    illustVersion: 1,`,
    `    imageStatus: 'pending_review',`,
    `    pdfUrl: '',`,
    `    createdAt: '${new Date().toISOString().split('T')[0]}',`,
    `    popular: false,`,
    `  },`,
  ]
  return lines.filter(Boolean).join('\n')
}

async function downloadImage(url, savePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(savePath)
    https.get(url, res => {
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', err => { fs.unlink(savePath, () => {}); reject(err) })
  })
}

function openaiRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
    }, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        const json = JSON.parse(data)
        if (json.error) reject(new Error(JSON.stringify(json.error)))
        else resolve(json)
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function anthropicRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
    }, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        const json = JSON.parse(data)
        if (json.error) reject(new Error(JSON.stringify(json.error)))
        else resolve(json)
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
