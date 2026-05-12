import Link from 'next/link'
import { Printer } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Printer className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-foreground">ぬりえプリント</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              保育士・幼稚園教諭のための<br />無料教材プリントサービス。<br />
              現場で本当に使いやすいUIを目指しています。
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">コラム</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/columns/benefits-of-coloring-for-kids" className="hover:text-foreground transition-colors">ぬりえの発達効果</Link></li>
              <li><Link href="/columns/coloring-for-2-year-olds" className="hover:text-foreground transition-colors">2歳からのぬりえ入門</Link></li>
              <li><Link href="/columns/dot-connect-benefits-for-kids" className="hover:text-foreground transition-colors">点つなぎの教育効果</Link></li>
              <li><Link href="/columns/sensory-play-benefits" className="hover:text-foreground transition-colors">感覚遊びの発達効果</Link></li>
              <li><Link href="/columns/outdoor-play-benefits" className="hover:text-foreground transition-colors">外遊びの発達効果</Link></li>
              <li><Link href="/columns" className="hover:text-foreground transition-colors">コラム一覧 →</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">年齢で探す</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/age/2" className="hover:text-foreground transition-colors">2歳向け</Link></li>
              <li><Link href="/category/age/3" className="hover:text-foreground transition-colors">3歳向け</Link></li>
              <li><Link href="/category/age/4" className="hover:text-foreground transition-colors">4歳向け</Link></li>
              <li><Link href="/category/age/5" className="hover:text-foreground transition-colors">5歳向け</Link></li>
              <li><Link href="/category/age/6" className="hover:text-foreground transition-colors">6歳向け</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">テーマ・季節</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/theme/animals" className="hover:text-foreground transition-colors">動物ぬりえ</Link></li>
              <li><Link href="/category/theme/dinosaurs" className="hover:text-foreground transition-colors">恐竜ぬりえ</Link></li>
              <li><Link href="/category/theme/vehicles" className="hover:text-foreground transition-colors">のりものぬりえ</Link></li>
              <li><Link href="/category/season/spring" className="hover:text-foreground transition-colors">春の教材</Link></li>
              <li><Link href="/category/season/summer" className="hover:text-foreground transition-colors">夏の教材</Link></li>
              <li><Link href="/category/season/autumn" className="hover:text-foreground transition-colors">秋の教材</Link></li>
              <li><Link href="/category/season/winter" className="hover:text-foreground transition-colors">冬の教材</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border space-y-4">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">このサイトについて</Link>
            <Link href="/editorial-policy" className="hover:text-foreground transition-colors">編集方針</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">よくある質問</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">お問い合わせ</Link>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground">© 2026 ぬりえプリント. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">教材は保育・教育目的での使用に限り無料です</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
