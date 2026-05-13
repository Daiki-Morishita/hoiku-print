import { NextResponse } from 'next/server'
import { getMaterialById } from '@/lib/data'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const material = getMaterialById(id)

  if (!material?.imageUrl) {
    return new NextResponse('Not found', { status: 404 })
  }

  return NextResponse.redirect(material.imageUrl, {
    headers: { 'Cache-Control': 'public, max-age=86400' },
  })
}
