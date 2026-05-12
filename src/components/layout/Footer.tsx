import Link from 'next/link'
import { Printer } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
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
            <h3 className="font-semibold text-sm mb-3">カテゴリ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/type/coloring" className="hover:text-foreground transition-colors">ぬりえ</Link></li>
              <li><Link href="/category/type/hiragana" className="hover:text-foreground transition-colors">ひらがな練習</Link></li>
              <li><Link href="/category/type/maze" className="hover:text-foreground transition-colors">迷路</Link></li>
              <li><Link href="/category/type/drawing" className="hover:text-foreground transition-colors">運筆プリント</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">コラム</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/columns/benefits-of-coloring-for-kids" className="hover:text-foreground transition-colors">ぬりえの発達効果</Link></li>
              <li><Link href="/columns/coloring-by-age-guide" className="hover:text-foreground transition-colors">年齢別ぬりえの選び方</Link></li>
              <li><Link href="/columns/hiragana-practice-guide" className="hover:text-foreground transition-colors">ひらがな練習の進め方</Link></li>
              <li><Link href="/columns/maze-benefits-for-kids" className="hover:text-foreground transition-colors">迷路遊びの効果</Link></li>
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
        </div>

        <div className="mt-10 pt-6 border-t border-border space-y-4">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">このサイトについて</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
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
