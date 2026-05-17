import Link from 'next/link'
import { Search, Home } from 'lucide-react'

export const metadata = {
  title: 'ページが見つかりません｜おとなのぬりえ',
}

export default function AdultNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="font-mincho text-[12px] text-primary tracking-[0.3em] mb-4">
        — 404 —
      </div>
      <h1 className="font-mincho text-[34px] md:text-[48px] font-black mb-3">ページが<br className="sm:hidden" />見つかりませんでした</h1>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-10">
        お探しのページは、削除されたか、URLが変更された可能性があります。<br />
        以下から目的のページを探してみてください。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-md mx-auto">
        <Link
          href="/adult"
          className="bg-foreground text-white px-5 py-4 rounded text-[14px] font-mincho font-bold hover:bg-primary transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          おとなのぬりえ ホーム
        </Link>
        <Link
          href="/adult/materials"
          className="bg-white border border-foreground/20 px-5 py-4 rounded text-[14px] font-mincho font-bold hover:border-primary transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 text-primary" />
          塗り絵を探す
        </Link>
      </div>

      <p className="text-[12px] text-muted-foreground">
        <Link href="/" className="underline hover:text-primary">こども向けのぬりえはこちら</Link>
      </p>
    </div>
  )
}
