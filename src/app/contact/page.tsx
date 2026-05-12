import Link from 'next/link'
import { ChevronRight, Mail, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'お問い合わせ',
  description: 'ぬりえプリントへのお問い合わせ・ご要望・不具合報告の窓口です。教材の追加リクエストもお気軽にお寄せください。',
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">ホーム</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">お問い合わせ</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold mb-4">お問い合わせ</h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        ぬりえプリントへのご質問・ご要望・不具合のご報告など、お気軽にご連絡ください。
        いただいた内容にはできる限り迅速にお返事いたします。
      </p>

      <div className="bg-white border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold mb-1">メールでのお問い合わせ</h2>
            <p className="text-sm text-muted-foreground">
              下記のメールアドレスまでご連絡ください。
            </p>
            <p className="mt-2 text-sm font-mono bg-muted px-3 py-2 rounded-lg inline-block">
              contact@nurie-print.com
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        よくいただくお問い合わせ
      </h2>
      <div className="space-y-4 text-sm leading-relaxed">
        <div>
          <h3 className="font-semibold mb-1">Q. 教材を商用で使ってもよいですか？</h3>
          <p className="text-muted-foreground">
            A. 保育・教育・家庭利用に限り無料でご使用いただけます。
            商用での再配布・販売、画像の二次配布は禁止しております。
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Q. 「こんな教材が欲しい」という要望は受け付けていますか？</h3>
          <p className="text-muted-foreground">
            A. はい、リクエストを歓迎しております。テーマ・対象年齢・用途などをメールでお知らせください。
            検討の上、可能なものから順次追加いたします。
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Q. 印刷したらズレてしまいました。</h3>
          <p className="text-muted-foreground">
            A. ブラウザの印刷ダイアログで「用紙サイズ：A4」「向き：横」「余白：なし」をご指定ください。
            それでも改善しない場合はメールで状況をお知らせいただけると助かります。
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Q. 画像に問題があります（著作権・不適切な内容等）。</h3>
          <p className="text-muted-foreground">
            A. 該当の教材ページのURLとあわせて、お早めにメールでご報告ください。
            内容を確認の上、速やかに対応いたします。
          </p>
        </div>
      </div>

      <div className="mt-10 text-xs text-muted-foreground bg-muted px-4 py-3 rounded-lg">
        ※ お問い合わせの内容によっては、お返事までお時間をいただく場合がございます。あらかじめご了承ください。
      </div>
    </div>
  )
}
