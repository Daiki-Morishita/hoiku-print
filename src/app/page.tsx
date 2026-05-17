import Link from 'next/link'
import { ArrowRight, ChevronRight, Clock } from 'lucide-react'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { materials, getPopularMaterials, getMaterialById, filterMaterials, getMaterialsForAudience } from '@/lib/data'
import { columns } from '@/lib/columns'

export const metadata = {
  alternates: { canonical: 'https://nurie-print.com' },
}

const kidsMaterials = getMaterialsForAudience('kids')
const totalMaterials = kidsMaterials.length

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ぬりえプリント',
  url: 'https://nurie-print.com',
  description: `保育士・幼稚園教諭のための無料ぬりえプリントサービス。${totalMaterials}点以上を無料配布。`,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://nurie-print.com/materials?search={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ぬりえプリント編集部',
  url: 'https://nurie-print.com',
  logo: { '@type': 'ImageObject', url: 'https://nurie-print.com/icon.svg', width: 512, height: 512 },
  description: '保育士・幼稚園教諭向けの無料ぬりえプリント配布サービス',
}

// Today's pick — deterministic rotation by day of year
function getTodaysPick() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / 86400000)
  const eligible = kidsMaterials.filter(m => (m.difficulty ?? 0) >= 2 && m.imageUrl)
  return eligible[dayOfYear % eligible.length] || kidsMaterials.find(m => m.imageUrl)!
}

// Theme summary with representative material
const THEMES = [
  { key: 'animals', label: '動物', sample: 'giraffe-easy-1', href: '/category/theme/animals' },
  { key: 'dinosaurs', label: '恐竜', sample: 'tyrannosaurus-easy-1', href: '/category/theme/dinosaurs' },
  { key: 'vehicles', label: '乗り物', sample: 'fire-truck-easy', href: '/category/theme/vehicles' },
  { key: 'sea', label: '海', sample: 'dolphin-easy', href: '/category/theme/sea' },
  { key: 'insects', label: '虫', sample: 'butterfly-easy-1', href: '/category/theme/insects' },
  { key: 'fruits', label: '食べ物', sample: 'apple-easy-1', href: '/category/theme/fruits' },
] as const

function getThemeSample(themeKey: string, sampleId: string) {
  const sample = getMaterialById(sampleId)
  if (sample?.imageUrl) return sample
  return filterMaterials({ theme: themeKey as Parameters<typeof filterMaterials>[0]['theme'] })
    .find(m => m.imageUrl)
}

const FAQS = [
  {
    q: 'ぬりえはすべて無料ですか？',
    a: `はい、現在公開している ${totalMaterials} 点すべて完全無料です。会員登録不要、商用利用以外は自由にお使いいただけます。`,
  },
  {
    q: '何歳から使えますか？',
    a: '2歳から6歳まで対応。年齢別ページから、お子さまに合った難易度のぬりえを選べます。',
  },
  {
    q: '印刷サイズは何ですか？',
    a: 'すべて A4 横長で最適化されています。家庭用プリンタ・園のコピー機どちらでも印刷可能です。',
  },
  {
    q: '園や教室で使ってもいいですか？',
    a: '保育園・幼稚園・教室での教材利用は自由です。販売・再配布のみご遠慮ください。',
  },
  {
    q: 'どのくらいの頻度で更新していますか？',
    a: '毎日新しい教材を追加しています。今月だけで 30 点以上の新作が公開予定です。',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function HomePage() {
  const popular = getPopularMaterials(12)
  const todaysPick = getTodaysPick()
  const featuredColumn = columns[0]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ===== HERO ===== */}
      <section className="pt-12 md:pt-16 pb-8 text-center">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="font-mincho text-[12px] md:text-[13px] text-primary tracking-[0.25em] mb-4">
            — 今日は何をぬる？ —
          </div>
          <h1 className="font-mincho text-[32px] md:text-[48px] font-black leading-[1.4] tracking-[0.02em] mb-6">
            先生たちと、<span className="text-primary">子どもたちへ</span>。
          </h1>
          <p className="text-[14px] md:text-[15px] text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            {totalMaterials} 点の塗り絵が、ぜんぶ無料。<br className="md:hidden" />
            年齢・季節・テーマで見つかります。
          </p>

          {/* Big search */}
          <form action="/materials" method="get" className="max-w-2xl mx-auto mb-6 flex border-[1.5px] border-foreground rounded-lg overflow-hidden bg-white shadow-md">
            <input
              name="search"
              type="text"
              placeholder="ぬりえを検索（例: きりん、2歳、ひな祭り）"
              className="flex-1 px-5 md:px-6 py-4 md:py-[18px] text-[15px] md:text-[16px] outline-none bg-transparent"
            />
            <button type="submit" className="bg-foreground text-background px-6 md:px-9 text-[14px] md:text-[15px] font-medium hover:bg-primary transition-colors">
              さがす
            </button>
          </form>

          {/* Tag suggestions */}
          <div className="text-[13px] text-muted-foreground max-w-2xl mx-auto">
            <span className="mr-2">よく検索されています：</span>
            {[
              { label: 'きりん', q: 'きりん' },
              { label: 'しんかんせん', q: '新幹線' },
              { label: '2歳児向け', q: '?age=2', isFilter: true },
              { label: '親子の動物', q: '親子' },
              { label: 'ティラノサウルス', q: 'ティラノ' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.isFilter ? `/materials${t.q}` : `/materials?search=${encodeURIComponent(t.q)}`}
                className="text-accent hover:text-primary mr-3 border-b border-dotted border-accent hover:border-primary transition-colors"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TODAY'S PICK ===== */}
      <section className="pb-12">
        <div className="max-w-[1080px] mx-auto px-6">
          <div className="bg-white border border-border rounded-xl p-7 md:p-10 grid md:grid-cols-2 gap-8 md:gap-10 items-center shadow-sm">
            <div>
              <div className="font-mincho text-[11px] text-muted-foreground tracking-[0.2em] mb-3">
                No. {String(materials.indexOf(todaysPick) + 1).padStart(3, '0')}　　今日のいちおし
              </div>
              <h2 className="font-mincho text-[26px] md:text-[32px] font-bold leading-[1.3] mb-4">
                {todaysPick.title}
              </h2>
              <p className="text-[14px] text-foreground/80 leading-relaxed mb-5 pl-4 border-l-[3px] border-primary">
                {todaysPick.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-6 text-[11px] text-muted-foreground">
                {todaysPick.ageMin && todaysPick.ageMax && (
                  <span className="bg-background px-2.5 py-1 rounded border border-border">
                    {todaysPick.ageMin}〜{todaysPick.ageMax}歳
                  </span>
                )}
                {todaysPick.difficulty && (
                  <span className="bg-background px-2.5 py-1 rounded border border-border">
                    難易度 {todaysPick.difficulty}
                  </span>
                )}
                {todaysPick.duration && (
                  <span className="bg-background px-2.5 py-1 rounded border border-border flex items-center gap-1">
                    <Clock className="w-3 h-3" />約{todaysPick.duration}分
                  </span>
                )}
              </div>
              <Link
                href={`/materials/${todaysPick.id}`}
                className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3 rounded text-[14px] font-medium hover:bg-primary transition-colors"
              >
                使ってみる
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="aspect-[1.414/1] bg-background border border-border rounded-md overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={todaysPick.imageUrl} alt={todaysPick.title} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== POPULAR MATERIALS ===== */}
      <section className="py-12 border-t border-border bg-background">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHead
            kicker="No. 01"
            title="人気の教材"
            count={`トップ ${popular.length}`}
            href="/materials"
            subtitle="過去30日でよく印刷されている教材"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {popular.map(material => (
              <CompactCard key={material.id} material={material} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== THEMES ===== */}
      <section className="py-12 border-t border-border">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHead
            kicker="No. 02"
            title="テーマで探す"
            count={`全${THEMES.length}カテゴリ`}
            subtitle="お子さま・園児が好きなテーマからお選びください"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {THEMES.map(theme => {
              const sample = getThemeSample(theme.key, theme.sample)
              const count = filterMaterials({ theme: theme.key as Parameters<typeof filterMaterials>[0]['theme'], audience: 'kids' }).length
              return (
                <Link
                  key={theme.key}
                  href={theme.href}
                  className="group bg-white border border-border rounded-lg overflow-hidden hover:border-primary transition-all hover:-translate-y-0.5"
                >
                  <div className="aspect-[1.414/1] bg-background flex items-center justify-center overflow-hidden">
                    {sample?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sample.imageUrl} alt={`${theme.label}のぬりえ`} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
                    ) : null}
                  </div>
                  <div className="p-3 text-center">
                    <div className="font-mincho text-[15px] font-bold mb-0.5">{theme.label}</div>
                    <div className="text-[10px] text-muted-foreground">{count}点</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== AGE ===== */}
      <section className="py-12 border-t border-border bg-background">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHead
            kicker="No. 03"
            title="年齢で探す"
            subtitle="2歳のはじめてから、6歳の力作まで"
          />
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {[2, 3, 4, 5, 6].map(age => {
              const count = filterMaterials({ age, audience: 'kids' }).length
              return (
                <Link
                  key={age}
                  href={`/category/age/${age}`}
                  className="bg-white border border-border rounded-lg p-4 md:p-6 text-center hover:border-primary hover:-translate-y-0.5 transition-all"
                >
                  <div className="font-mincho text-[24px] md:text-[36px] font-black leading-none">
                    {age}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-muted-foreground mt-1">歳</div>
                  <div className="text-[10px] md:text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/60">{count}点</div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== EDITORIAL QUOTE ===== */}
      <section className="py-16 md:py-20 bg-white border-y border-border">
        <div className="max-w-[860px] mx-auto px-6 text-center">
          <div className="text-primary text-[14px] mb-6">✶</div>
          <p className="font-mincho text-[18px] md:text-[22px] leading-[2] text-foreground">
            塗り絵は、ただの暇つぶしじゃない。<br />
            子どもが、はじめて自分で「色」を選ぶ時間。<br />
            その時間に、ふさわしい紙を届けたい。
          </p>
          <div className="text-primary text-[14px] mt-6">✶</div>
          <div className="text-[11px] text-muted-foreground mt-4 tracking-[0.15em]">
            — ぬりえプリント編集部 —
          </div>
        </div>
      </section>

      {/* ===== DIFFICULTY ===== */}
      <section className="py-12 border-t border-border bg-background">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHead
            kicker="No. 04"
            title="難易度で探す"
            subtitle="お子さまの発達段階に合わせて選べる4段階"
          />
          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            {[
              { diff: 1, label: 'かんたん', age: '2〜3歳', desc: 'シンプルで大きな線画。はじめてのぬりえに。' },
              { diff: 2, label: 'やさしい', age: '3歳〜', desc: '親しみやすいシーンつき。背景もシンプル。' },
              { diff: 3, label: 'ふつう', age: '3〜5歳', desc: '親子や複数体の構成。発展的に取り組める。' },
              { diff: 4, label: 'たのしい', age: '4〜6歳', desc: 'にぎやかな背景・細かな描写。集中して塗れる。' },
            ].map(({ diff, label, age, desc }) => (
              <Link
                key={diff}
                href={`/materials?difficulty=${diff}`}
                className="bg-white border border-border rounded-lg p-5 hover:border-primary transition-all flex items-start gap-4 hover:-translate-y-0.5"
              >
                <div className="font-mincho text-primary text-[22px] font-black leading-none pt-1 shrink-0">
                  0{diff}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-mincho text-[16px] font-bold">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{age}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PILLAR GUIDE ===== */}
      <section className="py-12 border-t border-border">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHead
            kicker="No. 05"
            title="読みもの"
            count="ぬりえ完全ガイド"
            href="/columns"
            subtitle="保育士・幼児教育の現場で役立つ知識を編集部が解説"
          />
          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <Link
              href={`/columns/${featuredColumn.slug}`}
              className="bg-white border border-border rounded-lg p-6 md:p-8 hover:border-primary transition-all"
            >
              <div className="flex items-center gap-3 mb-3 text-[11px] text-muted-foreground">
                <span className="bg-primary text-white px-2 py-0.5 rounded font-medium">特集</span>
                <span>{featuredColumn.category}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />約{featuredColumn.readingTime}分</span>
              </div>
              <h3 className="font-mincho text-[20px] md:text-[24px] font-bold leading-[1.4] mb-3">
                {featuredColumn.title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                {featuredColumn.description}
              </p>
              <span className="text-[13px] text-primary font-medium flex items-center gap-1">
                続きを読む <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
            <aside className="bg-white border border-border rounded-lg p-5">
              <h3 className="font-mincho text-[13px] font-bold mb-3 pb-2 border-b-2 border-primary">
                関連ガイド
              </h3>
              <ul className="space-y-0">
                {columns.slice(1, 9).map(col => (
                  <li key={col.slug} className="border-b border-dashed border-border last:border-0">
                    <Link
                      href={`/columns/${col.slug}`}
                      className="block py-2.5 text-[12px] text-foreground hover:text-primary transition-colors leading-snug"
                    >
                      {col.title.split('【')[0]}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-12 border-t border-border bg-background">
        <div className="max-w-[860px] mx-auto px-6">
          <SectionHead
            kicker="No. 06"
            title="よくある質問"
            subtitle="お問い合わせの多い質問にお答えします"
          />
          <div className="bg-white border border-border rounded-lg">
            {FAQS.map((faq, i) => (
              <div key={i} className={`p-5 md:p-6 ${i < FAQS.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="font-mincho text-[15px] md:text-[16px] font-bold mb-2 flex gap-2">
                  <span className="text-primary shrink-0">Q.</span>
                  <span>{faq.q}</span>
                </div>
                <div className="text-[13px] md:text-[14px] text-muted-foreground leading-relaxed flex gap-2 pl-0 md:pl-1">
                  <span className="text-primary font-bold shrink-0">A.</span>
                  <span>{faq.a}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/faq" className="text-[13px] text-accent hover:text-primary transition-colors border-b border-dotted">
              すべての質問を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-[860px] mx-auto px-6 text-center">
          <div className="font-mincho text-[11px] text-primary tracking-[0.25em] mb-4">
            — INVITATION —
          </div>
          <h2 className="font-mincho text-[26px] md:text-[34px] font-black leading-[1.5] mb-4">
            保育の現場を、<br />
            すこし、らくに。
          </h2>
          <p className="text-[14px] text-muted-foreground mb-8 leading-relaxed">
            雨の日も、自由時間も、行事前も。<br />
            すぐ使える教材が、ここにあります。
          </p>
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded text-[14px] font-medium hover:bg-primary transition-colors"
          >
            すべての教材を見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

function SectionHead({
  kicker,
  title,
  count,
  href,
  subtitle,
}: {
  kicker?: string
  title: string
  count?: string
  href?: string
  subtitle?: string
}) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-end justify-between border-b border-foreground/15 pb-3">
        <div>
          {kicker && (
            <div className="font-mincho italic text-[11px] text-primary mb-1 tracking-[0.1em]">
              {kicker}
            </div>
          )}
          <div className="flex items-baseline gap-3">
            <h2 className="font-mincho text-[20px] md:text-[26px] font-bold">{title}</h2>
            {count && <span className="text-[11px] text-primary">{count}</span>}
          </div>
        </div>
        {href && (
          <Link href={href} className="text-[12px] text-accent hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
            すべて見る<ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {subtitle && <p className="text-[12px] text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  )
}

function CompactCard({ material }: { material: ReturnType<typeof getPopularMaterials>[number] }) {
  return (
    <Link
      href={`/materials/${material.id}`}
      className="group bg-white border border-border rounded-lg overflow-hidden hover:border-primary transition-all hover:-translate-y-0.5"
    >
      <div className="aspect-[1.414/1] bg-background flex items-center justify-center overflow-hidden">
        {material.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={material.imageUrl} alt={material.title} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
        ) : null}
      </div>
      <div className="p-2.5">
        <h3 className="font-mincho text-[12px] font-bold mb-1 line-clamp-1">
          {material.title.split('（')[0]}
        </h3>
        <div className="text-[10px] text-muted-foreground flex gap-1.5 items-center">
          {material.ageMin && <span>{material.ageMin}-{material.ageMax}歳</span>}
          {material.difficulty && <span className="text-primary/70">·</span>}
          {material.difficulty && <span>難{material.difficulty}</span>}
        </div>
        {material.description && (
          <div className="text-[10px] text-primary mt-1.5 pt-1.5 border-t border-border/60 italic line-clamp-1">
            &ldquo;{material.description.slice(0, 28).replace(/[。、]+$/, '')}&rdquo;
          </div>
        )}
      </div>
    </Link>
  )
}
