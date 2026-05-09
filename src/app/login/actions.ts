'use server'

import { signIn } from '@/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'

export async function loginWithCredentials(email: string, password: string) {
  try {
    await signIn('credentials', { email, password, redirectTo: '/onboarding' })
  } catch (e) {
    if (e instanceof AuthError) return { error: 'メールアドレスまたはパスワードが間違っています' }
    throw e
  }
}

export async function registerWithCredentials(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: 'このメールアドレスはすでに登録されています' }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { email, password: hashed } })

  try {
    await signIn('credentials', { email, password, redirectTo: '/onboarding' })
  } catch (e) {
    if (e instanceof AuthError) return { error: '登録しましたがログインに失敗しました。再度ログインしてください' }
    throw e
  }
}

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/onboarding' })
}

export async function loginWithLINE() {
  await signIn('line', { redirectTo: '/onboarding' })
}
