import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getMaterialById } from '@/lib/data'

const FREE_LIMIT = 10

// POST: add to favorites (with free-plan limit)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const { materialId } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!getMaterialById(materialId)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const userId = session.user.id

  // Check limit (skip count if already favorited — idempotent add)
  const existing = await prisma.favorite.findUnique({
    where: { userId_materialId: { userId, materialId } },
  })
  if (existing) {
    return NextResponse.json({ ok: true, alreadyFavorited: true })
  }

  const count = await prisma.favorite.count({ where: { userId } })
  if (count >= FREE_LIMIT) {
    return NextResponse.json(
      { error: 'limit_reached', limit: FREE_LIMIT, count },
      { status: 402 }
    )
  }

  await prisma.favorite.create({ data: { userId, materialId } })
  return NextResponse.json({ ok: true, count: count + 1, limit: FREE_LIMIT })
}

// DELETE: remove from favorites
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const { materialId } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, materialId },
  })
  return NextResponse.json({ ok: true })
}

// PATCH: update groupName (move to group / un-group)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const { materialId } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  const groupName: string | null = body.groupName === '' ? null : (body.groupName ?? null)
  if (groupName !== null && groupName.length > 40) {
    return NextResponse.json({ error: 'group_name_too_long' }, { status: 400 })
  }
  await prisma.favorite.updateMany({
    where: { userId: session.user.id, materialId },
    data: { groupName },
  })
  return NextResponse.json({ ok: true })
}
