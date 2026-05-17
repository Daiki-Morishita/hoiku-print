import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

// POST: bulk action on a set of favorites
// body: { action: 'delete' | 'move', materialIds: string[], groupName?: string|null }
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  const action: string = body.action
  const materialIds: string[] = Array.isArray(body.materialIds) ? body.materialIds : []
  if (materialIds.length === 0) {
    return NextResponse.json({ error: 'no_targets' }, { status: 400 })
  }
  const userId = session.user.id

  if (action === 'delete') {
    await prisma.favorite.deleteMany({
      where: { userId, materialId: { in: materialIds } },
    })
    return NextResponse.json({ ok: true })
  }

  if (action === 'move') {
    const groupName: string | null = body.groupName === '' ? null : (body.groupName ?? null)
    if (groupName !== null && groupName.length > 40) {
      return NextResponse.json({ error: 'group_name_too_long' }, { status: 400 })
    }
    await prisma.favorite.updateMany({
      where: { userId, materialId: { in: materialIds } },
      data: { groupName },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
}
