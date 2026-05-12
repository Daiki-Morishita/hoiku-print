import Link from 'next/link'
import { Printer, Search, BookOpen, Home } from 'lucide-react'

export const metadata = {
  title: 'ページが見つかりません｜ぬりえプリント',
}

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
        <Printer className="w-10 h-10 text-primary/60" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-3">404</h1>
      <p className="text-lg font-semibold mb-2">ページが見つかりませんでした</p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-10">
        お探しのページは、削除されたか、URLが変更された可能性があります。
        <br />
        以下から目的のページを探してみてください。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <Link href="/" className="bg-primary text-white px-4 py-4 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex flex-col items-center gap-2">
          <Home className="w-5 h-5" />
          ホーム
        </Link>
        <Link href="/materials" className="bg-white border border-border px-4 py-4 rounded-xl text-sm font-medium hover:bg-muted transition-colors flex flex-col items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          教材を探す
        </Link>
        <Link href="/columns" className="bg-white border border-border px-4 py-4 rounded-xl text-sm font-medium hover:bg-muted transition-colors flex flex-col items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          コラム
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        ページが表示されない、リンク切れがある場合は
        <Link href="/contact" className="text-primary underline mx-1">お問い合わせ</Link>
        からお知らせいただけると助かります。
      </p>
    </div>
  )
}
