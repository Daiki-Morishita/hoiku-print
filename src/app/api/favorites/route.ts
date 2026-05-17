import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

// GET: list current user's favorite material IDs + their groupName
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { materialId: true, groupName: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    favorites: favorites.map(f => ({
      materialId: f.materialId,
      groupName: f.groupName,
      createdAt: f.createdAt,
    })),
    count: favorites.length,
    limit: 10,
  })
}
