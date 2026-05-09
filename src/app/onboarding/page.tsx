import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './OnboardingForm'

export const metadata = { title: '初期設定 | ぬりえプリント' }

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  if (profile?.onboardingDone) redirect('/materials')

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold mb-1">ようこそ！</h1>
          <p className="text-sm text-muted-foreground">
            簡単な情報を教えてください
          </p>
        </div>

        {/* メリット説明 */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 mb-4 text-sm text-foreground flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <span className="mt-0.5">📍</span>
            <span><b>都道府県</b>を設定すると、地域の行事や季節に合ったぬりえが優先表示されます</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5">🏫</span>
            <span><b>施設の種別</b>を設定すると、年齢層に合った教材をおすすめできます</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <OnboardingForm />
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          すべて任意です。後からマイページで変更できます
        </p>
      </div>
    </div>
  )
}
