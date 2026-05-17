import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getMaterialsForAudience, getPopularMaterials } from '@/lib/data'
import { THEME_LABELS, ADULT_THEMES } from '@/lib/types'

export const metadata = {
  title: 'おとなのぬりえ｜本格・写実の塗り絵を無料配布',
  description: '大人・シニアのための本格塗り絵プリント。曼荼羅・植物画・風景・幾何模様など、心を整える時間にぴったりの線画を無料でA4印刷できます。',
  alternates: { canonical: 'https://nurie-print.com/adult' },
}

const adultMaterials = getMaterialsForAudience('adult')
const totalAdult = adultMaterials.length

// 用意済みのテーマ別件数を表示するためのマップ
const ADULT_THEME_SHOWCASE: { theme: typeof ADULT_THEMES[number]; description: string }[] = [
  { theme: 'mandala', description: '幾何学的な対称性と細密さ。瞑想的な時間に。' },
  { theme: 'botanical', description: '植物学画調の精密な線画。葉脈や花弁を丁寧に。' },
  { theme: 'landscape', description: '風景の細密線画。遠近感を色で表現します。' },
  { theme: 'pattern', description: 'リズムのある幾何模様。配色の練習にも最適。' },
  { theme: 'animals-detail', description: '動物の毛並みや表情まで描き込んだ細密画。' },
  { theme: 'flowers-detail', description: '花弁一枚一枚の質感を活かす細密構図。' },
  { theme: 'cityscape', description: 'パリ・京都など都市の街並みを線画で。' },
  { theme: 'japanese-tradition', description: '和柄・伝統文様。日本の美意識を塗る。' },
]

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'おとなのぬりえ',
  url: 'https://nurie-print.com/adult',
  description: '大人・シニア向けの本格塗り絵プリント無料配布。曼荼羅・植物・風景。',
}

export default function AdultHomePage() {
  const popular = getPopularMaterials(8, 'adult')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      {/* Section switcher banner */}
      <div className="bg-foreground text-background text-[11px] py-2 text-center">
        いまご覧のセクション：<strong className="font-bold">おとなのぬりえ</strong>
        <Link href="/" className="underline hover:text-accent ml-2">こども向けはこちら →</Link>
      </div>

      {/* ===== HERO ===== */}
      <section className="pt-16 md:pt-24 pb-12 text-center">
        <div className="max-w-[1080px] mx-auto px-6">
          <div className="font-mincho text-[12px] text-primary tracking-[0.3em] mb-5">
            — A Q U I E T   H O U R —
          </div>
          <h1 className="font-mincho text-[32px] md:text-[56px] font-black leading-[1.3] tracking-[0.03em] mb-8">
            一日の終わりに、<br />
            <span className="text-primary">一枚だけ。</span>
          </h1>
          <p className="text-[14px] md:text-[16px] text-muted-foreground max-w-xl mx-auto mb-10 leading-loose">
            曼荼羅・植物画・風景・幾何模様。<br />
            心を整えるための本格的な線画を、{totalAdult > 0 ? `${totalAdult} 点` : 'これから順次'}無料配布します。
          </p>

          {/* Big search */}
          <form action="/adult/materials" method="get" className="max-w-xl mx-auto mb-6 flex border-[1.5px] border-foreground rounded overflow-hidden bg-card shadow-sm">
            <input
              name="search"
              type="text"
              placeholder="テーマで検索（曼荼羅・薔薇・風景…）"
              className="flex-1 px-5 py-4 text-[15px] outline-none bg-transparent"
            />
            <button type="submit" className="bg-foreground text-background px-8 text-[14px] font-medium hover:bg-primary transition-colors">
              さがす
            </button>
          </form>

          {totalAdult === 0 && (
            <div className="mt-8 inline-block bg-card border border-border rounded px-5 py-3 text-[12px] text-muted-foreground">
              新着教材は近日公開予定です。下のテーマから先行リクエストもいただけます。
            </div>
          )}
        </div>
      </section>

      {/* ===== THEMES (showcase) ===== */}
      <section className="py-12 border-t border-border">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="mb-8 pb-3 border-b border-foreground/15">
            <div className="font-mincho italic text-[11px] text-primary mb-1 tracking-[0.1em]">— Themes —</div>
            <h2 className="font-mincho text-[24px] md:text-[28px] font-bold">テーマ一覧</h2>
            <p className="text-[12px] text-muted-foreground mt-2">心の状態や、その日の気分にあわせて選んでください。</p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            {ADULT_THEME_SHOWCASE.map(({ theme, description }) => {
              const count = adultMaterials.filter(m => m.theme === theme).length
              return (
                <Link
                  key={theme}
                  href={`/adult/category/theme/${theme}`}
                  className="group bg-card border border-border rounded-lg p-6 hover:border-primary transition-all flex gap-4"
                >
                  <div className="font-mincho text-[28px] text-primary font-black leading-none pt-1">
                    {String(ADULT_THEME_SHOWCASE.findIndex(s => s.theme === theme) + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <h3 className="font-mincho text-[18px] font-bold group-hover:text-primary transition-colors">
                        {THEME_LABELS[theme]}
                      </h3>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {count > 0 ? `${count}点` : '準備中'}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== EDITORIAL QUOTE ===== */}
      <section className="py-20 md:py-28 bg-card border-y border-border">
        <div className="max-w-[760px] mx-auto px-6 text-center">
          <div className="text-primary text-[14px] mb-8">✶</div>
          <p className="font-mincho text-[18px] md:text-[22px] leading-[2.4] text-foreground">
            一筆ずつ、色を選ぶ。<br />
            それは、自分の機嫌をとる時間。<br />
            線の中だけで、世界が完結する贅沢。
          </p>
          <div className="text-primary text-[14px] mt-8">✶</div>
          <div className="text-[11px] text-muted-foreground mt-5 tracking-[0.2em]">
            — おとなのぬりえ 編集部 —
          </div>
        </div>
      </section>

      {/* ===== POPULAR ===== */}
      {popular.length > 0 && (
        <section className="py-12 border-t border-border">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="mb-8 pb-3 border-b border-foreground/15">
              <div className="font-mincho italic text-[11px] text-primary mb-1 tracking-[0.1em]">— Featured —</div>
              <h2 className="font-mincho text-[24px] md:text-[28px] font-bold">注目の塗り絵</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popular.map(m => (
                <Link
                  key={m.id}
                  href={`/adult/materials/${m.id}`}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-all"
                >
                  <div className="aspect-[1.414/1] bg-background flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.imageUrl} alt={m.title} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-mincho text-[13px] font-bold line-clamp-1">{m.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== USE CASES ===== */}
      <section className="py-12 border-t border-border">
        <div className="max-w-[860px] mx-auto px-6">
          <div className="mb-8 pb-3 border-b border-foreground/15">
            <div className="font-mincho italic text-[11px] text-primary mb-1 tracking-[0.1em]">— Use Cases —</div>
            <h2 className="font-mincho text-[24px] md:text-[28px] font-bold">こんな時間に</h2>
          </div>
          <div className="space-y-4">
            {[
              { title: '一日の終わりに', desc: '画面から離れて、線の中だけで完結する時間。スマホを置き、深呼吸ひとつ分の余白を作る習慣に。' },
              { title: 'コーヒーと一緒に', desc: '15〜30分で1ページ。お茶を淹れて、机に向かう前の静かな儀式として。' },
              { title: 'シニアの脳活・リハビリに', desc: '手指の細やかな動きと配色の判断が、認知機能の維持を支えます。介護施設・地域サロンでもご活用ください。' },
              { title: '不眠・心が落ち着かない夜に', desc: '反復的な細密塗りは瞑想に近い効果を持つとされています。眠る前の30分に。' },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-5 flex gap-5">
                <div className="font-mincho text-[18px] text-primary font-black leading-none pt-1 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="font-mincho text-[16px] font-bold mb-2">{item.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-[760px] mx-auto px-6 text-center">
          <div className="font-mincho text-[11px] text-primary tracking-[0.3em] mb-4">
            — INVITATION —
          </div>
          <h2 className="font-mincho text-[26px] md:text-[34px] font-black leading-[1.6] mb-6">
            今夜の、<br />
            一枚を選ぶ。
          </h2>
          <Link
            href="/adult/materials"
            className="inline-flex items-center gap-2 bg-foreground text-background px-9 py-4 rounded text-[14px] font-medium hover:bg-primary transition-colors"
          >
            すべての塗り絵を見る
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="mt-12 text-[12px] text-muted-foreground">
            <Link href="/" className="underline hover:text-primary">こども向けのぬりえはこちら</Link>
          </div>
        </div>
      </section>
    </>
  )
}
