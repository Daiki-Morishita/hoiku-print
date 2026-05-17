'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, User, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

type NavItem = { href: string; label: string; isNew?: boolean }

const KIDS_NAV: NavItem[] = [
  { href: '/category/theme/animals', label: '動物' },
  { href: '/category/theme/dinosaurs', label: '恐竜' },
  { href: '/category/theme/vehicles', label: '乗り物' },
  { href: '/category/theme/sea', label: '海' },
  { href: '/category/theme/insects', label: '虫', isNew: true },
  { href: '/category/theme/fruits', label: '食べ物', isNew: true },
  { href: '/category/age/3', label: '年齢で探す' },
  { href: '/materials?difficulty=1', label: '難易度で探す' },
  { href: '/columns', label: '読みもの' },
  { href: '/faq', label: 'FAQ' },
]

const ADULT_NAV: NavItem[] = [
  { href: '/adult/category/theme/mandala', label: '曼荼羅' },
  { href: '/adult/category/theme/botanical', label: '植物画' },
  { href: '/adult/category/theme/landscape', label: '風景' },
  { href: '/adult/category/theme/pattern', label: '幾何模様' },
  { href: '/adult/category/theme/animals-detail', label: '動物（細密）' },
  { href: '/adult/category/theme/flowers-detail', label: '花（細密）' },
  { href: '/adult/category/theme/japanese-tradition', label: '和柄' },
  { href: '/adult/materials', label: 'すべて見る' },
]

export function Header({ materialCount = 555 }: { materialCount?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const { data: session } = useSession()
  const pathname = usePathname() ?? ''
  const isAdult = pathname.startsWith('/adult')
  const nav = isAdult ? ADULT_NAV : KIDS_NAV
  const searchAction = isAdult ? '/adult/materials' : '/materials'

  return (
    <>
      {/* Audience switcher (top) */}
      <div className="bg-[#1f1f1f] text-[#dcdcdc] text-[11px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex justify-between items-center h-8 sm:h-9">
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1 rounded-full transition-colors ${!isAdult ? 'bg-white text-[#1f1f1f] font-bold' : 'hover:text-white'}`}
            >
              こども向け
            </Link>
            <Link
              href="/adult"
              className={`px-3 py-1 rounded-full transition-colors ${isAdult ? 'bg-white text-[#1f1f1f] font-bold' : 'hover:text-white'}`}
            >
              おとな向け
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition-colors">運営について</Link>
            <Link href="/editorial-policy" className="hover:text-white transition-colors">編集方針</Link>
            <Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link>
            {session ? (
              <button onClick={() => signOut({ callbackUrl: '/' })} className="hover:text-white transition-colors flex items-center gap-1">
                <LogOut className="w-3 h-3" />ログアウト
              </button>
            ) : (
              <Link href="/login" className="hover:text-white transition-colors">ログイン</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[220px_1fr_220px] gap-3 md:gap-8 items-center h-16 md:h-20">
            {/* Logo */}
            <Link href={isAdult ? '/adult' : '/'} className="flex items-baseline gap-0 group">
              <span className="font-mincho text-[22px] md:text-[26px] font-black tracking-[0.04em] text-foreground group-hover:text-primary transition-colors">
                {isAdult ? 'おとなの' : 'ぬりえ'}
              </span>
              <span className="font-mincho text-[22px] md:text-[26px] font-black tracking-[0.04em] text-primary">
                {isAdult ? 'ぬりえ' : 'プリント'}
              </span>
            </Link>

            {/* Search bar (desktop) */}
            <form action={searchAction} method="get" className="hidden md:flex border-[1.5px] border-foreground rounded overflow-hidden bg-card shadow-sm">
              <input
                name="search"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={isAdult ? 'テーマで検索（曼荼羅・薔薇・風景…）' : 'ぬりえを検索（例: きりん、2歳、ひな祭り）'}
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
              />
              <button type="submit" className="bg-foreground text-background px-6 text-sm font-medium hover:bg-primary transition-colors flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                さがす
              </button>
            </form>

            {/* Meta count (desktop) */}
            <div className="hidden md:block text-right">
              <div className="font-mincho text-[24px] font-black text-primary leading-none">{isAdult ? '近日' : materialCount}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{isAdult ? '公開予定' : '点の無料教材'}</div>
            </div>

            {/* Mobile actions */}
            <div className="md:hidden flex items-center gap-2 justify-self-end">
              <Link href="/materials" aria-label="検索" className="p-2 hover:bg-muted rounded transition-colors">
                <Search className="w-5 h-5" />
              </Link>
              <button
                className="p-2 hover:bg-muted rounded transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="メニュー"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Category nav (desktop) */}
        <nav className="hidden md:block border-t border-border bg-background">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex items-center gap-7 h-10 text-[13px] overflow-x-auto">
              {nav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors whitespace-nowrap font-medium flex items-center gap-1.5"
                >
                  {item.label}
                  {item.isNew && (
                    <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">NEW</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3">
              <form action={searchAction} method="get" className="flex border-[1.5px] border-foreground rounded overflow-hidden bg-card mb-3">
                <input
                  name="search"
                  type="text"
                  placeholder={isAdult ? 'テーマで検索' : 'ぬりえを検索'}
                  className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
                />
                <button type="submit" className="bg-foreground text-background px-4 text-sm font-medium">
                  さがす
                </button>
              </form>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0">
                {nav.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-sm border-b border-border/50 flex items-center gap-1.5"
                  >
                    {item.label}
                    {item.isNew && <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">NEW</span>}
                  </Link>
                ))}
              </div>
              {session ? (
                <Link href="/account" className="block mt-3 py-2 text-sm flex items-center gap-1.5" onClick={() => setMobileOpen(false)}>
                  <User className="w-4 h-4" />マイページ
                </Link>
              ) : (
                <Link href="/login" className="block mt-3 py-2 text-sm" onClick={() => setMobileOpen(false)}>
                  ログイン
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
