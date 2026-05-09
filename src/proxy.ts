import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // ログイン済みユーザーが /login にアクセス → リダイレクト
  if (session && pathname === '/login') {
    const dest = session.user.onboardingDone ? '/materials' : '/onboarding'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // 要認証ページへの未ログインアクセス → /login へ
  const protected_ = ['/account', '/onboarding']
  if (!session && protected_.some(p => pathname.startsWith(p))) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/account/:path*', '/onboarding/:path*'],
}
