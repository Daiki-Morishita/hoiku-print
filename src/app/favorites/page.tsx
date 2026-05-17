import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getMaterialById } from '@/lib/data'
import { FavoritesView, type FavoriteItem } from './FavoritesView'

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
  const items: FavoriteItem[] = favRows
    .map(f => {
      const m = getMaterialById(f.materialId)
      if (!m) return null
      return { material: m, groupName: f.groupName }
    })
    .filter((v): v is FavoriteItem => !!v)

  return <FavoritesView initialItems={items} limit={10} />
}
