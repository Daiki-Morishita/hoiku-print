import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, Users, Wrench, Lightbulb, Printer, ChevronRight } from 'lucide-react'
import { getMaterialById, getRelatedMaterials, materials } from '@/lib/data'
import { CATEGORY_LABELS, DIFFICULTY_LABELS, SEASON_LABELS, EVENT_LABELS } from '@/lib/types'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { Badge } from '@/components/ui/badge'
import { PrintButton } from '@/components/materials/PrintButton'

export async function generateStaticParams() {
  return materials.map(m => ({ id: m.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const material = getMaterialById(id)
  if (!material) return {}
  return {
    title: material.title,
    description: material.description,
    openGraph: {
      title: material.title,
      description: material.description,
      type: 'article',
    },
  }
}

const difficultyColor: Record<number, string> = {
  1: 'bg-green-100 text-green-800 border-green-200',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  3: 'bg-red-100 text-red-800 border-red-200',
}

const categoryEmoji: Record<string, string> = {
  coloring: '🖍️', hiragana: 'あ', numbers: '1', drawing: '✏️',
  maze: '🗺', dotconnect: '⚫', craft: '🎨', scissors: '✂️',
}
const themeEmoji: Record<string, string> = {
  animals: '🐾', dinosaurs: '🦕', vehicles: '🚒', trains: '🚃',
  food: '🍎', sea: '🐟', flowers: '🌸',
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const material = getMaterialById(id)
  if (!material) notFound()

  const related = getRelatedMaterials(material, 4)
  const ageLabel = material.ageMin === material.ageMax
    ? `${material.ageMin}歳`
    : `${material.ageMin}〜${material.ageMax}歳`

  const hasImage = !!material.imageUrl
  // 印刷用: API経由で長辺3500pxにアップスケールした画像を使う
  const printImageUrl = material.imageUrl
    ? material.imageUrl.endsWith('.svg')
      ? material.imageUrl                    // SVGはそのまま（解像度非依存）
      : `/api/print-image/${material.id}`    // JPG/PNG → 高解像度API
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: material.title,
    description: material.description,
    educationalLevel: ageLabel,
    educationalUse: 'practice',
    inLanguage: 'ja',
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by-nc/4.0/',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ===== 印刷専用エリア（画面では非表示） ===== */}
      <div className="hidden print:block print-area">
        <div style={{ padding: '10mm 15mm' }}>
          {/* 名前欄 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6mm', borderBottom: '2px solid #000', paddingBottom: '3mm' }}>
            <span style={{ fontSize: '14pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>お名前：</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: '10pt', color: '#666' }}>ぬりえプリント</span>
          </div>

          {/* タイトル */}
          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '4mm' }}>
            {material.title}
          </h1>

          {/* 教材画像（印刷用高解像度APIから取得） */}
          {printImageUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6mm' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={printImageUrl}
                alt={material.title}
                style={{ width: '170mm', height: 'auto', maxHeight: '220mm', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* 活動メモ */}
          <div style={{ borderTop: '1px solid #ccc', paddingTop: '3mm', fontSize: '9pt', color: '#444' }}>
            対象年齢：{ageLabel}　　難易度：{DIFFICULTY_LABELS[material.difficulty]}　　目安時間：{material.duration}分
          </div>
        </div>
      </div>

      {/* ===== 通常表示エリア ===== */}
      <div className="print:hidden max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* パンくず */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">ホーム</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/materials" className="hover:text-foreground transition-colors">教材一覧</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground line-clamp-1">{material.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* メインコンテンツ */}
          <div>
            {/* 教材プレビュー（画面表示用・next/imageで最適化） */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl overflow-hidden mb-6 relative flex items-center justify-center min-h-64">
              {hasImage ? (
                <Image
                  src={material.imageUrl}
                  alt={material.title}
                  width={480}
                  height={360}
                  className="w-full max-w-md mx-auto object-contain p-6"
                  unoptimized
                />
              ) : (
                <div className="text-8xl py-12 select-none">
                  {material.theme ? (themeEmoji[material.theme] ?? categoryEmoji[material.category] ?? '🖨') : (categoryEmoji[material.category] ?? '🖨')}
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${difficultyColor[material.difficulty]}`}>
                  {DIFFICULTY_LABELS[material.difficulty]}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-border font-medium">
                  {CATEGORY_LABELS[material.category]}
                </span>
              </div>
            </div>

            {/* タイトル */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{material.title}</h1>
            <p className="text-muted-foreground mb-4 leading-relaxed">{material.description}</p>

            {/* タグ */}
            <div className="flex flex-wrap gap-2 mb-6">
              {material.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
              {material.season && <Badge variant="outline" className="text-xs">{SEASON_LABELS[material.season]}</Badge>}
              {material.event && <Badge variant="outline" className="text-xs">{EVENT_LABELS[material.event]}</Badge>}
            </div>

            {/* 必要道具 */}
            <div className="bg-white border border-border rounded-xl p-4 mb-4">
              <h2 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                <Wrench className="w-4 h-4 text-primary" />
                必要な道具
              </h2>
              <div className="flex flex-wrap gap-2">
                {material.tools.map(tool => (
                  <span key={tool} className="text-sm bg-muted px-3 py-1 rounded-full">{tool}</span>
                ))}
              </div>
            </div>

            {/* 活動提案 */}
            <div className="bg-white border border-border rounded-xl p-4">
              <h2 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                <Lightbulb className="w-4 h-4 text-accent" />
                活動のアイデア
              </h2>
              <ul className="space-y-2">
                {material.activityIdeas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-accent font-bold shrink-0">•</span>
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-4">
            {/* 印刷ボタン */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Printer className="w-4 h-4 text-primary" />
                印刷する
              </h2>
              <PrintButton materialTitle={material.title} />
              <p className="text-xs text-muted-foreground mt-2.5 text-center">
                A4・白黒印刷に最適化済み
              </p>
            </div>

            {/* 教材情報 */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <h2 className="font-semibold mb-4 text-sm">教材情報</h2>
              <dl className="space-y-3">
                <InfoRow icon={<Users className="w-4 h-4" />} label="対象年齢" value={ageLabel} />
                <InfoRow icon={<Clock className="w-4 h-4" />} label="目安時間" value={`約${material.duration}分`} />
                <InfoRow
                  icon={<span className="w-4 h-4 flex items-center justify-center text-xs font-bold">難</span>}
                  label="難易度"
                  value={DIFFICULTY_LABELS[material.difficulty]}
                />
              </dl>
            </div>

            <Link
              href="/materials"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              教材一覧に戻る
            </Link>
          </div>
        </div>

        {/* 関連教材 */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold mb-4">関連する教材</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(m => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}
