import Link from 'next/link'
import { Star, ArrowRight, Printer, Heart, Users } from 'lucide-react'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { getPopularMaterials, materials, getMaterialById } from '@/lib/data'
import { CATEGORY_LABELS, SEASON_LABELS, EVENT_LABELS } from '@/lib/types'
import { HomeSearch } from '@/components/HomeSearch'

export default function HomePage() {
  const popular = getPopularMaterials(6)
  const totalCount = materials.length

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/8 to-background pb-16 pt-12 sm:pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-6 font-medium">
            <Heart className="w-3 h-3" />
            保育士・幼稚園教諭のために
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-5 leading-tight">
            「今すぐ印刷して<br className="sm:hidden" />使える」<br />
            <span className="text-primary">保育教材がそろう場所</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            ぬりえ・ひらがな・迷路など、現場で本当に使える教材を無料配布。
            年齢・季節・行事で絞り込んで、すぐ印刷できます。
          </p>

          <HomeSearch />

          <div className="flex items-center justify-center gap-6 sm:gap-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">{totalCount}</strong> 教材</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span>2〜6歳対応</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary" />
              <span>完全無料</span>
            </div>
          </div>
        </div>
      </section>

      {/* 状況で探す（保育士の課題に直結） */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-4">
        <SectionHeader title="今の状況で探す" subtitle="保育現場のあの場面に、すぐ使える教材を" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          {[
            { label: '雨の日', emoji: '🌧️', query: '?category=coloring&age=3', desc: '室内で静かに' },
            { label: '朝の受け入れ', emoji: '🌅', query: '?difficulty=1&age=3', desc: 'すぐ取り組める' },
            { label: '自由時間', emoji: '⏰', query: '?category=coloring', desc: '手軽に楽しめる' },
            { label: '行事前', emoji: '🎉', query: '?season=summer', desc: '季節・行事テーマ' },
            { label: '帰り待ち', emoji: '🎒', query: '?duration=5', desc: '5〜10分でできる' },
            { label: '延長保育', emoji: '🌙', query: '?category=maze', desc: '集中力を育てる' },
          ].map(({ label, emoji, query, desc }) => (
            <Link
              key={label}
              href={`/materials${query}`}
              className="group bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <span className="text-3xl shrink-0">{emoji}</span>
              <div>
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 年齢で探す */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <SectionHeader title="年齢で探す" subtitle="年齢に合った教材だけを表示します" href="/materials" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-6">
          {[2, 3, 4, 5, 6].map(age => (
            <Link
              key={age}
              href={`/category/age/${age}`}
              className="group bg-white border border-border rounded-2xl p-4 text-center hover:border-primary/40 hover:bg-primary/3 transition-all"
            >
              <div className="text-3xl mb-2">
                {age === 2 ? '👶' : age === 3 ? '🧒' : age === 4 ? '👦' : age === 5 ? '🧑' : '👧'}
              </div>
              <div className="font-bold text-foreground">{age}歳</div>
              <div className="text-xs text-muted-foreground mt-0.5">向け</div>
            </Link>
          ))}
        </div>
      </section>

      {/* カテゴリ */}
      <section className="bg-muted/30 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader title="種類で探す" subtitle="教材の種類から探せます" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const icons: Record<string, string> = {
                coloring: '🖍️', hiragana: 'あ', numbers: '1️⃣',
                drawing: '✏️', maze: '🗺️', dotconnect: '⚫',
                craft: '🎨', scissors: '✂️',
              }
              return (
                <Link
                  key={key}
                  href={`/category/type/${key}`}
                  className="bg-white border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <span className="text-2xl w-8 text-center shrink-0">{icons[key]}</span>
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 2歳向け特集 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👶</span>
            <div>
              <h2 className="text-xl font-bold">2歳向けぬりえ</h2>
              <p className="text-sm text-muted-foreground">はじめてのぬりえに。極太ラインで塗りやすい設計</p>
            </div>
            <Link href="/category/age/2" className="ml-auto text-sm text-primary hover:text-primary/80 flex items-center gap-1 shrink-0">
              もっと見る <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {(['dog-simple', 'rabbit-simple-1', 'bear-simple-1'] as const).map(id => {
              const m = getMaterialById(id)
              const shortTitle: Record<string, string> = {
                'dog-simple': 'こいぬ',
                'rabbit-simple-1': 'うさぎ',
                'bear-simple-1': 'くまさん',
              }
              return (
                <Link key={id} href={`/materials/${id}`}
                  className="bg-white rounded-xl border border-white/60 overflow-hidden hover:shadow-md transition-all group">
                  <div className="aspect-square bg-white flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m?.imageUrl ?? `/materials/${id}.svg`} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="px-2 pb-2 text-xs font-medium text-center truncate">
                    {shortTitle[id]}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 人気教材 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-12">
        <SectionHeader title="人気の教材" subtitle="保育現場でよく使われている教材" href="/materials" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          {popular.map(material => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      </section>

      {/* 季節・行事 */}
      <section className="bg-muted/30 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <SectionHeader title="季節で探す" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                {Object.entries(SEASON_LABELS).map(([key, label]) => {
                  const icons: Record<string, string> = {
                    spring: '🌸', summer: '🌊', autumn: '🍂', winter: '❄️',
                  }
                  return (
                    <Link
                      key={key}
                      href={`/category/season/${key}`}
                      className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
                    >
                      <span className="text-2xl">{icons[key]}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div>
              <SectionHeader title="行事で探す" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                {Object.entries(EVENT_LABELS).slice(0, 6).map(([key, label]) => {
                  const icons: Record<string, string> = {
                    tanabata: '🎋', setsubun: '🫘', summerfestival: '🏮',
                    halloween: '🎃', christmas: '🎄', hinamatsuri: '🎎',
                    sports: '🏃', graduation: '🎓', mothers: '💐', fathers: '👔',
                  }
                  return (
                    <Link
                      key={key}
                      href={`/category/event/${key}`}
                      className="bg-white border border-border rounded-xl p-3 flex items-center gap-2.5 hover:border-primary/40 hover:shadow-sm transition-all"
                    >
                      <span className="text-xl shrink-0">{icons[key]}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-primary/8 rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            保育現場をもっとラクに
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            雨の日も、自由時間も、行事前も。<br />
            すぐ使える教材がここにあります。
          </p>
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            すべての教材を見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          すべて見る
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}
