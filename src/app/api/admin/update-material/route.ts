import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

type UpdatePayload = {
  id: string
  title?: string
  description?: string
  activityIdeas?: string[]
  imageStatus?: string
  illustNotes?: string
  tags?: string[]
  category?: string
  theme?: string
}

function escapeForTs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export async function PATCH(request: Request) {
  try {
    const body: UpdatePayload = await request.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data.ts')
    let content = fs.readFileSync(dataPath, 'utf8')

    // idでブロックの範囲を特定
    const idPattern = new RegExp(`id: '${id.replace(/[-]/g, '\\-')}'`)
    const idMatch = idPattern.exec(content)
    if (!idMatch) return NextResponse.json({ error: '対象エントリが見つかりません' }, { status: 404 })

    // ブロックの開始位置（直前の { を探す）
    const blockStart = content.lastIndexOf('\n  {', idMatch.index)
    // ブロックの終了位置（},）
    const blockEnd = content.indexOf('\n  },', idMatch.index) + 5
    let block = content.slice(blockStart, blockEnd)

    if ('title' in fields && fields.title !== undefined) {
      block = block.replace(/title: '.*?'/, `title: '${escapeForTs(fields.title)}'`)
    }

    if ('description' in fields && fields.description !== undefined) {
      block = block.replace(/description: '.*?'/, `description: '${escapeForTs(fields.description)}'`)
    }

    if ('imageStatus' in fields && fields.imageStatus !== undefined) {
      block = block.replace(/imageStatus: '.*?'/, `imageStatus: '${fields.imageStatus}'`)
    }

    if ('illustNotes' in fields && fields.illustNotes !== undefined) {
      if (block.includes('illustNotes:')) {
        block = block.replace(/illustNotes: '.*?'/, `illustNotes: '${escapeForTs(fields.illustNotes)}'`)
      } else {
        // imageStatus行の後ろに追記
        block = block.replace(/(imageStatus: '.*?',)/, `$1\n    illustNotes: '${escapeForTs(fields.illustNotes)}',`)
      }
    }

    if ('activityIdeas' in fields && fields.activityIdeas !== undefined) {
      const ideas = fields.activityIdeas
        .filter(s => s.trim())
        .map(s => `      '${escapeForTs(s)}',`)
        .join('\n')
      // replace multiline activityIdeas block without 's' flag
      block = block.replace(
        /activityIdeas: \[[\s\S]*?\n    \]/,
        `activityIdeas: [\n${ideas}\n    ]`
      )
    }

    if ('category' in fields && fields.category !== undefined) {
      block = block.replace(/category: '.*?'/, `category: '${fields.category}'`)
    }

    if ('theme' in fields && fields.theme !== undefined) {
      if (block.match(/theme: '.*?'/)) {
        block = block.replace(/theme: '.*?'/, `theme: '${fields.theme}'`)
      } else {
        // categoryの後ろに追加
        block = block.replace(/(category: '.*?',)/, `$1 theme: '${fields.theme}',`)
      }
    }

    if ('tags' in fields && fields.tags !== undefined) {
      const tags = fields.tags
        .filter(s => s.trim())
        .map(s => `'${escapeForTs(s)}'`)
        .join(', ')
      block = block.replace(/tags: \[[\s\S]*?\]/, `tags: [${tags}]`)
    }

    content = content.slice(0, blockStart) + block + content.slice(blockEnd)
    fs.writeFileSync(dataPath, content, 'utf8')

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
