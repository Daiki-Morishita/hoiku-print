import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/components/Providers'

const GA_ID = 'G-TFK69QCK70'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nurie-print.com'),
  title: {
    default: 'ぬりえプリント | 保育士のための無料教材プリント',
    template: '%s | ぬりえプリント',
  },
  description: '保育園・幼稚園の先生向け無料ぬりえ・知育プリント配布サイト。年齢別・テーマ別・季節別に検索でき、すぐに印刷して使えます。',
  keywords: ['ぬりえ', '塗り絵', '保育園', '幼稚園', '無料プリント', '知育', '保育士', '教材'],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://nurie-print.com',
    siteName: 'ぬりえプリント',
    title: 'ぬりえプリント | 保育士のための無料教材プリント',
    description: '保育園・幼稚園の先生向け無料ぬりえ・知育プリント配布サイト。すぐ印刷して使えます。',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'ぬりえプリント' }],
  },
  robots: { index: true, follow: true },
  twitter: {
    card: 'summary_large_image',
    site: '@nurie_print',
    title: 'ぬりえプリント | 保育士のための無料教材プリント',
    description: '保育園・幼稚園の先生向け無料ぬりえ・知育プリント配布サイト。すぐ印刷して使えます。',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background font-[var(--font-noto-sans-jp),sans-serif]">
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
