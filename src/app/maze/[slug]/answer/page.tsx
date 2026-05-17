import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMazeBySlug, getAllSlugs } from '@/lib/maze/loader'
import { MazeSheet } from '../../MazeSheet'
import styles from '../../maze.module.css'

type Params = { slug: string }

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const maze = getMazeBySlug(slug)
  if (!maze) return { title: 'こたえが みつかりません｜ぬりえプリント' }
  const title = `しかくのめいろ ${maze.difficulty_label} No.${String(maze.no).padStart(3, '0')}・こたえ｜ぬりえプリント`
  return {
    title,
    description: `しかくのめいろ ${maze.difficulty_label} No.${maze.no} の こたえページ`,
    robots: { index: false, follow: true },
    alternates: { canonical: `https://nurie-print.com/maze/${maze.slug}/answer` },
  }
}

export default async function MazeAnswerPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const maze = getMazeBySlug(slug)
  if (!maze) notFound()
  return (
    <div className={styles['page-bg']}>
      <MazeSheet maze={maze} isAnswer />
    </div>
  )
}
