import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, Users, Wrench, Lightbulb, Printer, ChevronRight, ChevronLeft } from 'lucide-react'
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
  const ageLabel = material.ageMin === material.ageMax
    ? `${material.ageMin}歳`
    : `${material.ageMin}〜${material.ageMax}歳`
  const seoDesc = `${material.description}${material.ageMin ? `${ageLabel}向け、A4印刷対応の無料ぬりえプリントです。` : ''}`
  return {
    title: `${material.title}｜${ageLabel}向け無料プリント`,
    description: seoDesc,
    alternates: { canonical: `https://nurie-print.com/materials/${id}` },
    openGraph: {
      title: material.title,
      description: seoDesc,
      type: 'article',
      ...(material.imageUrl ? { images: [{ url: material.imageUrl, alt: material.title }] } : {}),
    },
  }
}

const difficultyColor: Record<number, string> = {
  1: 'bg-green-100 text-green-800 border-green-200',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  3: 'bg-red-100 text-red-800 border-red-200',
  4: 'bg-purple-100 text-purple-800 border-purple-200',
}

const categoryEmoji: Record<string, string> = {
  coloring: '🖍️', hiragana: 'あ', numbers: '1', drawing: '✏️',
  maze: '🗺', dotconnect: '⚫', craft: '🎨', scissors: '✂️',
}
const themeEmoji: Record<string, string> = {
  animals: '🐾', dinosaurs: '🦕', vehicles: '🚒', trains: '🚃',
  food: '🍎', sea: '🐟', flowers: '🌸', insects: '🐛', characters: '⭐', park: '🌳',
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const material = getMaterialById(id)
  if (!material) notFound()

  const idx = materials.findIndex(m => m.id === id)
  const prevMaterial = idx > 0 ? materials[idx - 1] : null
  const nextMaterial = idx >= 0 && idx < materials.length - 1 ? materials[idx + 1] : null

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
    publisher: {
      '@type': 'Organization',
      name: 'ぬりえプリント',
      url: 'https://nurie-print.com',
      logo: { '@type': 'ImageObject', url: 'https://nurie-print.com/icon.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://nurie-print.com/materials/${material.id}` },
    ...(material.imageUrl ? { image: material.imageUrl.startsWith('http') ? material.imageUrl : `https://nurie-print.com${material.imageUrl}` } : {}),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://nurie-print.com' },
      { '@type': 'ListItem', position: 2, name: '教材一覧', item: 'https://nurie-print.com/materials' },
      { '@type': 'ListItem', position: 3, name: material.title, item: `https://nurie-print.com/materials/${material.id}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* ===== 印刷専用エリア（画面では非表示・横A4・画像のみ・モノクロ） ===== */}
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: economy;
            print-color-adjust: economy;
          }
          .print-area {
            filter: grayscale(100%) contrast(1) !important;
          }
        }
      `}</style>
      <div className="hidden print:block print-area" style={{ position: 'relative', width: '297mm', height: '210mm', boxSizing: 'border-box', overflow: 'hidden' }}>
        {printImageUrl && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5mm' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={printImageUrl}
              alt={material.title}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
        {/* 右下ブランディング */}
        <div style={{
          position: 'absolute',
          right: '8mm',
          bottom: '5mm',
          backgroundColor: '#eeeeee',
          padding: '0.5mm 1.5mm',
          borderRadius: '1mm',
          fontSize: '9pt',
          color: '#333',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4em',
        }}>
          <span>{material.title}</span>
          <span style={{ color: '#aaa' }}>｜</span>
          <span>ぬりえプリント</span>
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
              {prevMaterial && (
                <Link
                  href={`/materials/${prevMaterial.id}`}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white border border-border rounded-full shadow-md flex items-center justify-center text-foreground hover:text-primary transition-all"
                  title={`前: ${prevMaterial.title}`}
                  aria-label="前の教材"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
              )}
              {nextMaterial && (
                <Link
                  href={`/materials/${nextMaterial.id}`}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white border border-border rounded-full shadow-md flex items-center justify-center text-foreground hover:text-primary transition-all"
                  title={`次: ${nextMaterial.title}`}
                  aria-label="次の教材"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
              )}
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

            {/* 解説テキスト */}
            <div className="bg-white border border-border rounded-xl p-5 mb-4 leading-relaxed text-sm space-y-3">
              <h2 className="font-semibold text-base mb-1">この教材について</h2>
              <p>
                「{material.title}」は、{ageLabel}のお子様向けに作られた{CATEGORY_LABELS[material.category]}プリントです。
                {DIFFICULTY_LABELS[material.difficulty]}難易度・所要時間の目安は約{material.duration}分で、
                ご家庭でのおうち時間や保育園・幼稚園での自由遊び、設定保育の教材としてお使いいただけます。
              </p>
              <p>
                {material.description}
                線画はA4横長・白黒印刷に最適化されており、家庭用プリンタでそのまま印刷してすぐご利用いただけます。
                {material.tools.length > 0 && (
                  <>使用する道具は{material.tools.join('、')}など、身近なもので取り組めます。</>
                )}
              </p>
              <p>
                ぬりえは、手先の発達・色彩感覚・集中力を育てる大切な遊びです。
                完成した作品はお部屋に飾ったり、季節の制作物として活用したり、お子様の成長記録としてアルバムに残すのもおすすめです。
                同じ題材でも年齢や難易度に応じて構図を変えて練習できるため、繰り返しの活動にもご活用ください。
              </p>
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
