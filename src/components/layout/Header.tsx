'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search, Printer } from 'lucide-react'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              ぬりえプリント
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/materials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              教材を探す
            </Link>
            <Link href="/category/age/3" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              年齢で探す
            </Link>
            <Link href="/category/season/summer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              季節で探す
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/materials"
              className="hidden md:flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Search className="w-4 h-4" />
              教材を検索
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="メニュー"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            <Link href="/materials" className="py-2 px-3 rounded-lg text-sm hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              教材を探す
            </Link>
            <Link href="/category/age/3" className="py-2 px-3 rounded-lg text-sm hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              年齢で探す
            </Link>
            <Link href="/category/season/summer" className="py-2 px-3 rounded-lg text-sm hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              季節で探す
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
