import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getMaterialById } from '@/lib/data'
import { FavoritesView } from './FavoritesView'

export const metadata = {
  title: 'お気に入りのぬりえ',
  robots: { index: false, follow: false },
}

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/favorites')
  }

  const favRows = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  const materials = favRows
    .map(f => getMaterialById(f.materialId))
    .filter((m): m is NonNullable<typeof m> => !!m)

  return <FavoritesView materials={materials} limit={10} />
}
