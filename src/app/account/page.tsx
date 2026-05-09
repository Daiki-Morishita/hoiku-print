import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { User, Building2, MapPin, LogOut } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'マイページ',
}

const FACILITY_LABELS: Record<string, string> = {
  nursery:      '保育園',
  kindergarten: '幼稚園',
  combined:     '認定こども園',
  afterschool:  '学童保育',
  individual:   '個人',
  other:        'その他',
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">マイページ</h1>

      {/* アカウント情報 */}
      <section className="bg-white border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">アカウント情報</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="w-12 h-12 rounded-full" />
            ) : (
              <User className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium">{session.user.name ?? 'ユーザー'}</p>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
      </section>

      {/* 施設情報 */}
      <section className="bg-white border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground">施設情報</h2>
          <Link
            href="/onboarding"
            className="text-xs text-primary hover:underline"
          >
            編集
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>
              {profile?.facilityType
                ? FACILITY_LABELS[profile.facilityType] ?? profile.facilityType
                : '未設定'}
              {profile?.facilityName && `（${profile.facilityName}）`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{profile?.prefecture ?? '未設定'}</span>
          </div>
        </div>
      </section>

      {/* ログアウト */}
      <section className="bg-white border border-border rounded-2xl p-6">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </form>
      </section>
    </div>
  )
}
