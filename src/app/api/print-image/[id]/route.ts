/**
 * /api/print-image/[id]
 *
 * 印刷用高解像度画像を返す API ルート
 * - JPG / PNG: Sharpで長辺3500pxにアップスケール（lanczos3）してJPEG返却
 * - SVG: そのまま返却（ブラウザが解像度非依存でレンダリング）
 * - Cache-Control: 24時間 CDNキャッシュ
 */
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { getMaterialById } from '@/lib/data'

const PRINT_LONG_EDGE = 3500   // 長辺px (A4 300dpi = 2480×3508 → 3500で近似)
const JPEG_QUALITY   = 95      // 印刷用なので高品質

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const material = getMaterialById(id)

  if (!material?.imageUrl) {
    return new NextResponse('Not found', { status: 404 })
  }

  const imageUrl = material.imageUrl              // Supabase URL または /materials/...
  const isRemote = /^https?:\/\//.test(imageUrl)

  // 画像バッファを取得
  let inputBuffer: Buffer
  if (isRemote) {
    try {
      const res = await fetch(imageUrl)
      if (!res.ok) return new NextResponse('Failed to fetch remote image', { status: 404 })
      inputBuffer = Buffer.from(await res.arrayBuffer())
    } catch {
      return new NextResponse('Failed to fetch remote image', { status: 502 })
    }
  } else {
    const absolutePath = path.join(process.cwd(), 'public', imageUrl)
    if (!fs.existsSync(absolutePath)) {
      return new NextResponse('Image file not found', { status: 404 })
    }
    inputBuffer = fs.readFileSync(absolutePath)
  }

  // ── SVG はそのまま返す ──────────────────────────────────────
  if (imageUrl.endsWith('.svg')) {
    return new NextResponse(inputBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  }

  const outputBuffer = await sharp(inputBuffer)
    .resize({
      width:  PRINT_LONG_EDGE,
      height: PRINT_LONG_EDGE,
      fit:    'inside',            // 長辺=3500px・アスペクト比維持
      withoutEnlargement: false,   // アップスケール許可（1500→3500px）
      kernel: sharp.kernel.lanczos3, // 高品質補間
    })
    .sharpen({ sigma: 0.8 })       // アップスケール後に軽くシャープネス
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer()

  return new NextResponse(outputBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type':        'image/jpeg',
      'Cache-Control':       'public, max-age=86400',
      'Content-Disposition': `inline; filename="${id}-print.jpg"`,
      'X-Original-Id':       id,
    },
  })
}
