import Link from 'next/link'
import type { MazeRecord } from '@/lib/maze/types'
import { buildMazeSvg, RABBIT_SVG, CARROT_SVG } from '@/lib/maze/svg'
import styles from './maze.module.css'
import { PrintButton } from './PrintButton'

type Props = {
  maze: MazeRecord
  isAnswer?: boolean
}

type Edge = 'left' | 'right' | 'top' | 'bottom' | 'circle'

function charStyle(edge: Edge, xPct: number, yPct: number): React.CSSProperties {
  // 円形迷路: viewBox 内に既に外側にオフセット済みの位置で渡ってくる → そのまま %配置・中心揃え
  if (edge === 'circle') {
    return { left: `${xPct}%`, top: `${yPct}%`, transform: 'translate(-50%, -50%)' }
  }
  if (edge === 'left') return { right: 'calc(100% + 10px)', top: `${yPct}%`, transform: 'translateY(-50%)' }
  if (edge === 'right') return { left: 'calc(100% + 10px)', top: `${yPct}%`, transform: 'translateY(-50%)' }
  if (edge === 'top') return { bottom: 'calc(100% + 10px)', left: `${xPct}%`, transform: 'translateX(-50%)' }
  return { top: 'calc(100% + 10px)', left: `${xPct}%`, transform: 'translateX(-50%)' }
}

export function MazeSheet({ maze, isAnswer = false }: Props) {
  const { svg: mazeSvg, startXPct, startYPct, startEdge, goalXPct, goalYPct, goalEdge } = buildMazeSvg(maze, isAnswer)
  return (
    <div className={styles['sheet-frame']}>
      <div className={styles.sheet}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles['brand-mark']}>ぬ</div>
            <div className={styles['brand-meta']}>
              <span className={styles['brand-name']}>ぬりえプリント</span>
              <span className={styles['brand-sub']}>NURIE-PRINT.COM</span>
            </div>
          </div>
          <div className={styles.fields}>
            <div className={styles.field}>
              <span className={styles['field-label']}>なまえ</span>
              <span className={`${styles['field-line']} ${styles['field-line-long']}`}></span>
            </div>
            <div className={styles.field}>
              <span className={styles['field-label']}>ひづけ</span>
              <span className={`${styles['field-line']} ${styles['field-line-short']}`}></span>
              <span className={styles['date-unit']}>月</span>
              <span className={`${styles['field-line']} ${styles['field-line-short']}`}></span>
              <span className={styles['date-unit']}>日</span>
            </div>
          </div>
          <div className={styles['age-badge']}>{maze.age_label}</div>
        </header>

        <div className={styles['title-block']}>
          <div className={styles['title-row']}>
            <div className={styles['title-main']}>
              {maze.shape_label}
              <span className={styles['title-difficulty']}>{maze.difficulty_label}</span>
            </div>
            <div className={styles['title-id']}>No.{String(maze.no).padStart(3, '0')}</div>
          </div>
          <div className={styles['title-sub']}>うさぎさんを にんじんまで つれていこう！</div>
        </div>

        {isAnswer && (
          <div className={styles['answer-banner']}>★ ただしい みち（あかい せん）★</div>
        )}

        <div className={styles['maze-stage']}>
          <div className={styles['maze-frame']}>
            <div className={styles['char-at-opening']} style={charStyle(startEdge, startXPct, startYPct)}>
              <div className={styles['char-svg']} dangerouslySetInnerHTML={{ __html: RABBIT_SVG }} />
              <span className={`${styles['point-label']} ${styles['start-label']}`}>スタート</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: mazeSvg }} />
            <div className={styles['char-at-opening']} style={charStyle(goalEdge, goalXPct, goalYPct)}>
              <div className={styles['char-svg']} dangerouslySetInnerHTML={{ __html: CARROT_SVG }} />
              <span className={`${styles['point-label']} ${styles['goal-label']}`}>ゴール</span>
            </div>
          </div>
        </div>

        <div className={styles.reward}>
          <div className={styles['reward-label']}>
            <span className={styles['star-icon']}></span>できたら シールを はろう！
          </div>
          <div className={styles.stickers}>
            <div className={styles.sticker}>★</div>
            <div className={styles.sticker}>★</div>
            <div className={styles.sticker}>★</div>
          </div>
        </div>

        <div className={styles['web-actions']}>
          <PrintButton />
          {isAnswer ? (
            <Link href={`/maze/${maze.slug}`} className={`${styles.btn} ${styles['btn-back']}`}>
              ← もんだいに もどる
            </Link>
          ) : (
            <Link href={`/maze/${maze.slug}/answer`} className={`${styles.btn} ${styles['btn-answer']}`}>
              こたえを みる →
            </Link>
          )}
        </div>

        <footer className={styles.footer}>
          <span>© ぬりえプリント　　<span className={styles['footer-brand-url']}>nurie-print.com</span></span>
        </footer>
      </div>
    </div>
  )
}
