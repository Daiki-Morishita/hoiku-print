import Link from 'next/link'
import { Printer, Heart, Users, Sparkles, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'ぬりえプリントについて',
  description: '保育士・幼稚園教諭・ご家庭で使える無料の幼児向け教材プリント配布サイト「ぬりえプリント」の運営理念とサービス内容のご紹介。',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">ホーム</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">このサイトについて</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">ぬりえプリントについて</h1>

      <section className="prose max-w-none text-foreground leading-relaxed space-y-4 mb-10">
        <p>
          「ぬりえプリント」は、保育士・幼稚園教諭の先生方、そしてご家庭でお子様と過ごす保護者の方々のために、
          <strong>すぐに印刷して使える幼児向け教材プリント</strong>を無料で配布するサービスです。
        </p>
        <p>
          現場で「明日の活動にちょうどいい教材が欲しい」「子どもが集中できるぬりえを探したい」と思ったとき、
          年齢・季節・行事・難易度などの条件でサッと絞り込み、A4で1クリック印刷できる──
          そんな <strong>「現場で本当に使いやすいUI」</strong> を目指して作っています。
        </p>
      </section>

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        サービスの特徴
      </h2>
      <ul className="space-y-3 mb-10 text-sm leading-relaxed">
        <li className="flex gap-2"><span className="text-primary">•</span>
          <span><strong>完全無料</strong>：会員登録不要・ダウンロードや印刷に制限はありません。</span></li>
        <li className="flex gap-2"><span className="text-primary">•</span>
          <span><strong>A4・白黒印刷に最適化</strong>：園や家庭にある一般的なプリンタでそのまま使えます。</span></li>
        <li className="flex gap-2"><span className="text-primary">•</span>
          <span><strong>年齢別の難易度設計</strong>：2〜6歳までの発達段階に応じて4段階（simple／easy／normal／rich）で構成。</span></li>
        <li className="flex gap-2"><span className="text-primary">•</span>
          <span><strong>豊富なテーマ</strong>：ぬりえ・ひらがな・数字・迷路・運筆など、動物・恐竜・乗り物・公園など多様な題材を用意。</span></li>
        <li className="flex gap-2"><span className="text-primary">•</span>
          <span><strong>活動アイデア付き</strong>：各教材に「保育・家庭での活用例」を添えています。</span></li>
      </ul>

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-primary" />
        運営理念
      </h2>
      <p className="text-sm leading-relaxed mb-10">
        子どもにとっての「描く・塗る・なぞる」体験は、手先の発達・集中力・創造性を育てる大切な時間です。
        私たちは、その時間を支える先生・保護者の方々が「教材探し」に時間を奪われないよう、
        質の高い素材を、必要なときにすぐ取り出せる形で提供することを目指しています。
      </p>

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        想定利用シーン
      </h2>
      <ul className="space-y-2 mb-10 text-sm leading-relaxed">
        <li className="flex gap-2"><span className="text-primary">•</span>保育園・幼稚園での自由遊び・設定保育の教材として</li>
        <li className="flex gap-2"><span className="text-primary">•</span>季節行事（七夕・ハロウィン・クリスマス等）の制作活動の素材として</li>
        <li className="flex gap-2"><span className="text-primary">•</span>ご家庭での雨の日のおうち遊びに</li>
        <li className="flex gap-2"><span className="text-primary">•</span>祖父母宅・帰省先での孫との時間に</li>
        <li className="flex gap-2"><span className="text-primary">•</span>児童館・学童・子育て支援センター等での配布物として</li>
      </ul>

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Printer className="w-5 h-5 text-primary" />
        利用について
      </h2>
      <ul className="space-y-2 mb-10 text-sm leading-relaxed">
        <li className="flex gap-2"><span className="text-primary">•</span>教材は保育・教育・家庭利用に限り無料でご使用いただけます。</li>
        <li className="flex gap-2"><span className="text-primary">•</span>商用での再配布・販売、画像の二次配布は禁止です。</li>
        <li className="flex gap-2"><span className="text-primary">•</span>ライセンスは CC BY-NC 4.0（非商用）に準じます。</li>
      </ul>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/materials" className="block bg-primary text-white text-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          教材一覧を見る
        </Link>
        <Link href="/privacy" className="block bg-white border border-border text-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
          プライバシーポリシー
        </Link>
        <Link href="/contact" className="block bg-white border border-border text-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
          お問い合わせ
        </Link>
      </div>
    </div>
  )
}
