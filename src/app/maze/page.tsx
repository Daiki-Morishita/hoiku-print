import type { Metadata } from 'next'
import Link from 'next/link'
import { getMazesByShape } from '@/lib/maze/loader'
import { buildMazeSvg } from '@/lib/maze/svg'
import { MAZE_SHAPE_ORDER, MAZE_SHAPE_LABELS, MAZE_DIFFICULTY_LABELS } from '@/lib/maze/types'
import styles from './maze.module.css'

export const metadata: Metadata = {
  title: 'めいろプリント 無料｜2〜6歳 / かんたん〜とてもむずかしい｜ぬりえプリント',
  description: '2歳から6歳までの子ども向け迷路プリントを無料ダウンロード。かんたん・ふつう・むずかしい・とてもむずかしいの4段階。印刷してすぐ遊べる、登録不要のA4プリントです。',
  alternates: { canonical: 'https://nurie-print.com/maze' },
  openGraph: {
    title: 'めいろプリント 無料｜ぬりえプリント',
    description: '2〜6歳むけ・印刷無料・登録不要のめいろプリント',
    url: 'https://nurie-print.com/maze',
    type: 'website',
  },
}

export default function MazeIndexPage() {
  return (
    <div className={styles['page-bg']}>
      <div className={styles['list-container']}>
        <h1 className={styles['list-title']}>めいろプリント</h1>
        <p className={styles['list-lead']}>
          2歳〜6歳までむけの、しかくのめいろ。難易度4段階。印刷無料・登録不要。
        </p>

        {MAZE_SHAPE_ORDER.map(shape => {
          const items = getMazesByShape(shape)
          if (items.length === 0) return null
          return (
            <section key={shape} className={styles['difficulty-section']}>
              <h2 className={styles['difficulty-heading']}>
                <span className={styles['difficulty-chip']}>{MAZE_SHAPE_LABELS[shape]}</span>
                <span style={{ fontWeight: 400, fontSize: 14, color: '#7E7066' }}>
                  {items.length}枚
                </span>
              </h2>
              <div className={styles['maze-grid']}>
                {items.map(m => {
                  const { svg } = buildMazeSvg(m)
                  return (
                    <Link key={m.slug} href={`/maze/${m.slug}`} className={styles['maze-card']}>
                      <div className={styles['maze-card-thumb']} dangerouslySetInnerHTML={{ __html: svg }} />
                      <div className={styles['maze-card-title']}>
                        {MAZE_DIFFICULTY_LABELS[m.difficulty]} No.{String(m.no).padStart(3, '0')}
                      </div>
                      <div className={styles['maze-card-meta']}>{m.age_label}・ターン{m.turns}回</div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
