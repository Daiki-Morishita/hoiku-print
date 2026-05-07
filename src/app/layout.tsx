import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'ほいくぷりんと | 保育士のための無料教材プリント',
    template: '%s | ほいくぷりんと',
  },
  description: '保育園・幼稚園の先生向け無料ぬりえ・知育プリント配布サイト。年齢別・季節別・行事別に検索でき、すぐに印刷して使えます。',
  keywords: ['ぬりえ', '塗り絵', '保育園', '幼稚園', '無料プリント', '知育', '保育士', '教材'],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://hoiku-print.vercel.app',
    siteName: 'ほいくぷりんと',
    title: 'ほいくぷりんと | 保育士のための無料教材プリント',
    description: '保育園・幼稚園の先生向け無料ぬりえ・知育プリント配布サイト。すぐ印刷して使えます。',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
