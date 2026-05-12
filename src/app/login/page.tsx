import { LoginForm } from './LoginForm'

export const metadata = { title: 'ログイン | ぬりえプリント', robots: { index: false, follow: false } }

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">ログイン</h1>
          <p className="text-sm text-muted-foreground">
            保育教材を保存・管理するにはログインが必要です
          </p>
        </div>
        <LoginForm />
        <p className="text-xs text-center text-muted-foreground mt-6">
          ログインすることで
          <a href="/terms" className="underline underline-offset-2 hover:text-foreground">利用規約</a>
          と
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">プライバシーポリシー</a>
          に同意したものとみなします
        </p>
      </div>
    </div>
  )
}
