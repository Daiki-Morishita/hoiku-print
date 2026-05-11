import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    const normalized = query.trim().toLowerCase()
    if (!normalized) return NextResponse.json({ error: 'empty query' }, { status: 400 })

    await prisma.searchRequest.upsert({
      where: { query: normalized },
      update: { count: { increment: 1 } },
      create: { query: normalized },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const requests = await prisma.searchRequest.findMany({
      orderBy: { count: 'desc' },
    })
    return NextResponse.json(requests)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
