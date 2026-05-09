'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

const NEEDS_NAME = ['nursery', 'kindergarten', 'combined', 'afterschool']

export async function saveOnboarding(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const facilityType = formData.get('facilityType') as string | null
  const facilityName = NEEDS_NAME.includes(facilityType ?? '')
    ? (formData.get('facilityName') as string | null) ?? null
    : null
  const prefecture = (formData.get('prefecture') as string | null) || null

  await prisma.profile.upsert({
    where:  { userId: session.user.id },
    update: { facilityType, facilityName, prefecture, onboardingDone: true },
    create: { userId: session.user.id, facilityType, facilityName, prefecture, onboardingDone: true },
  })

  redirect('/materials')
}
