'use client'

/**
 * ImageUploader — 管理者用イラストアップロード + Claude Vision 自動解析コンポーネント
 *
 * 1. ドラッグ&ドロップ or ファイル選択
 * 2. /api/admin/analyze-image へ送信
 * 3. AI が提案したメタデータをフォームで編集
 * 4. data.ts スニペットをコピー
 */

import { useState, useCallback, useRef } from 'react'
import type { SuggestedMeta } from '@/app/api/admin/analyze-image/route'

type AnalyzeResult = {
  meta: SuggestedMeta
  snippet: string
  savedPath: string
}

type Status = 'idle' | 'uploading' | 'done' | 'error'

// ── カテゴリ選択肢 ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'coloring',    label: 'ぬりえ' },
  { value: 'hiragana',   label: 'ひらがな' },
  { value: 'numbers',    label: '数字・数え方' },
  { value: 'drawing',    label: '運筆' },
  { value: 'maze',       label: '迷路' },
  { value: 'dotconnect', label: '点つなぎ' },
  { value: 'craft',      label: '工作' },
  { value: 'scissors',   label: 'ハサミ練習' },
]

const THEMES = [
  { value: '',           label: '（なし）' },
  { value: 'animals',    label: '動物' },
  { value: 'dinosaurs',  label: '恐竜' },
  { value: 'vehicles',   label: 'はたらくくるま' },
  { value: 'trains',     label: '電車・乗り物' },
  { value: 'food',       label: '食べ物' },
  { value: 'sea',        label: '海の生き物' },
  { value: 'insects',    label: '虫' },
  { value: 'flowers',    label: '花・植物' },
  { value: 'characters', label: 'キャラクター風' },
]

const SEASONS = [
  { value: '',        label: '（なし）' },
  { value: 'spring',  label: '春' },
  { value: 'summer',  label: '夏' },
  { value: 'autumn',  label: '秋' },
  { value: 'winter',  label: '冬' },
]

const EVENTS = [
  { value: '',             label: '（なし）' },
  { value: 'tanabata',     label: '七夕' },
  { value: 'setsubun',     label: '節分' },
  { value: 'summerfestival', label: '夏祭り' },
  { value: 'halloween',    label: 'ハロウィン' },
  { value: 'christmas',    label: 'クリスマス' },
  { value: 'hinamatsuri',  label: 'ひな祭り' },
  { value: 'sports',       label: '運動会' },
  { value: 'graduation',   label: '卒園式・入園式' },
  { value: 'mothers',      label: '母の日' },
  { value: 'fathers',      label: '父の日' },
]

// ── コンポーネント ─────────────────────────────────────────────────────────

export function ImageUploader() {
  const [status, setStatus]     = useState<Status>('idle')
  const [preview, setPreview]   = useState<string | null>(null)
  const [result, setResult]     = useState<AnalyzeResult | null>(null)
  const [meta, setMeta]         = useState<SuggestedMeta | null>(null)
  const [snippet, setSnippet]   = useState<string>('')
  const [copied, setCopied]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [isDragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── ファイル処理 ─────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    setStatus('uploading')
    setError(null)
    setResult(null)
    setCopied(false)

    // プレビュー
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const fd = new FormData()
      fd.append('image', file)

      const res  = await fetch('/api/admin/analyze-image', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? 'Unknown error')
      }

      setResult(json)
      setMeta(json.meta)
      setSnippet(json.snippet)
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
      setStatus('error')
    }
  }, [])

  // ── ドラッグ&ドロップ ────────────────────────────────────────────────────

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  // ── メタ更新ヘルパー ─────────────────────────────────────────────────────

  const updateMeta = <K extends keyof SuggestedMeta>(key: K, value: SuggestedMeta[K]) => {
    setMeta(prev => {
      if (!prev) return prev
      const next = { ...prev, [key]: value }
      // スニペット再生成
      setSnippet(buildSnippet(next, result?.savedPath ?? ''))
      return next
    })
  }

  // ── コピー ────────────────────────────────────────────────────────────────

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── レンダリング ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ドロップゾーン */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={[
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <>
            <div className="text-5xl mb-3">🖼️</div>
            <p className="text-sm font-medium text-gray-700">
              画像をドロップ、またはクリックして選択
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG / PNG / WebP</p>
          </>
        )}
      </div>

      {/* ローディング */}
      {status === 'uploading' && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Claude Vision で解析中…</p>
            <p className="text-xs text-blue-600 mt-0.5">画像を読み取ってメタデータを自動生成しています</p>
          </div>
        </div>
      )}

      {/* エラー */}
      {status === 'error' && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* 結果 */}
      {status === 'done' && meta && (
        <div className="space-y-5">

          {/* ── ヘッダー ── */}
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-xl">✅</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">解析完了</p>
              <p className="text-xs text-gray-500">
                保存先: <code className="bg-gray-100 px-1 rounded">{result?.savedPath}</code>
              </p>
            </div>
          </div>

          {/* ── メタデータ編集フォーム ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                🤖 AI 提案メタデータ（編集可能）
              </p>
            </div>

            <div className="p-5 grid sm:grid-cols-2 gap-4">

              {/* ID */}
              <Field label="ID（英数字・ハイフン）">
                <input
                  type="text"
                  value={meta.id}
                  onChange={e => updateMeta('id', e.target.value)}
                  className="input"
                />
              </Field>

              {/* タイトル */}
              <Field label="タイトル（日本語）">
                <input
                  type="text"
                  value={meta.title}
                  onChange={e => updateMeta('title', e.target.value)}
                  className="input"
                />
              </Field>

              {/* 説明 */}
              <Field label="説明文" className="sm:col-span-2">
                <textarea
                  value={meta.description}
                  onChange={e => updateMeta('description', e.target.value)}
                  rows={2}
                  className="input resize-none"
                />
              </Field>

              {/* カテゴリ */}
              <Field label="カテゴリ">
                <select
                  value={meta.category}
                  onChange={e => updateMeta('category', e.target.value)}
                  className="input"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </Field>

              {/* テーマ */}
              <Field label="テーマ">
                <select
                  value={meta.theme ?? ''}
                  onChange={e => updateMeta('theme', e.target.value || undefined)}
                  className="input"
                >
                  {THEMES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Field>

              {/* 年齢 */}
              <Field label="対象年齢（最小）">
                <select
                  value={meta.ageMin}
                  onChange={e => updateMeta('ageMin', Number(e.target.value) as SuggestedMeta['ageMin'])}
                  className="input"
                >
                  {[2,3,4,5,6].map(a => <option key={a} value={a}>{a}歳</option>)}
                </select>
              </Field>

              <Field label="対象年齢（最大）">
                <select
                  value={meta.ageMax}
                  onChange={e => updateMeta('ageMax', Number(e.target.value) as SuggestedMeta['ageMax'])}
                  className="input"
                >
                  {[2,3,4,5,6].map(a => <option key={a} value={a}>{a}歳</option>)}
                </select>
              </Field>

              {/* 難易度 */}
              <Field label="難易度">
                <select
                  value={meta.difficulty}
                  onChange={e => updateMeta('difficulty', Number(e.target.value) as 1|2|3)}
                  className="input"
                >
                  <option value={1}>1 — やさしい</option>
                  <option value={2}>2 — ふつう</option>
                  <option value={3}>3 — むずかしい</option>
                </select>
              </Field>

              {/* 所要時間 */}
              <Field label="目安時間（分）">
                <select
                  value={meta.duration}
                  onChange={e => updateMeta('duration', Number(e.target.value) as SuggestedMeta['duration'])}
                  className="input"
                >
                  {[5,10,15,20,30].map(d => <option key={d} value={d}>{d}分</option>)}
                </select>
              </Field>

              {/* 季節 */}
              <Field label="季節">
                <select
                  value={meta.season ?? ''}
                  onChange={e => updateMeta('season', e.target.value || undefined)}
                  className="input"
                >
                  {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>

              {/* 行事 */}
              <Field label="行事">
                <select
                  value={meta.event ?? ''}
                  onChange={e => updateMeta('event', e.target.value || undefined)}
                  className="input"
                >
                  {EVENTS.map(ev => <option key={ev.value} value={ev.value}>{ev.label}</option>)}
                </select>
              </Field>

              {/* タグ */}
              <Field label="タグ（カンマ区切り）" className="sm:col-span-2">
                <input
                  type="text"
                  value={meta.tags.join(', ')}
                  onChange={e => updateMeta('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  className="input"
                />
              </Field>

              {/* 道具 */}
              <Field label="必要な道具（カンマ区切り）" className="sm:col-span-2">
                <input
                  type="text"
                  value={meta.tools.join(', ')}
                  onChange={e => updateMeta('tools', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  className="input"
                />
              </Field>

              {/* 活動アイデア */}
              <Field label="活動アイデア（1行1件）" className="sm:col-span-2">
                <textarea
                  value={meta.activityIdeas.join('\n')}
                  onChange={e => updateMeta('activityIdeas', e.target.value.split('\n').map(l => l.trim()).filter(Boolean))}
                  rows={4}
                  className="input resize-none"
                />
              </Field>

            </div>
          </div>

          {/* ── data.ts スニペット ── */}
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
              <p className="text-xs font-mono text-gray-400">src/lib/data.ts に追加するコード</p>
              <button
                onClick={copySnippet}
                className={[
                  'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600',
                ].join(' ')}
              >
                {copied ? '✅ コピー済み' : '📋 コピー'}
              </button>
            </div>
            <pre className="px-5 py-4 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre leading-relaxed">
              {snippet}
            </pre>
          </div>

          {/* ── 次のステップ ── */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-xs text-blue-800 space-y-1">
            <p className="font-semibold">📝 次のステップ</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>上のコードを <code className="bg-blue-100 px-1 rounded">src/lib/data.ts</code> の materials 配列に追記</li>
              <li>必要なら画像ファイルをリネーム（<code className="bg-blue-100 px-1 rounded">{result?.savedPath}</code>）</li>
              <li>このページを再読み込みして一覧で確認</li>
              <li>確認後 <code className="bg-blue-100 px-1 rounded">imageStatus: &apos;approved&apos;</code> に更新</li>
            </ol>
          </div>

          {/* 別の画像をアップロード */}
          <button
            onClick={() => {
              setStatus('idle')
              setPreview(null)
              setResult(null)
              setMeta(null)
              setError(null)
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            別の画像を解析する
          </button>
        </div>
      )}
    </div>
  )
}

// ── ユーティリティコンポーネント ────────────────────────────────────────────

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

// ── スニペット再生成（クライアントサイド） ─────────────────────────────────

function buildSnippet(meta: SuggestedMeta, savedPath: string): string {
  const lines = [
    `  {`,
    `    id: '${meta.id}',`,
    `    title: '${meta.title}',`,
    `    description: '${meta.description}',`,
    `    ageMin: ${meta.ageMin},`,
    `    ageMax: ${meta.ageMax},`,
    `    difficulty: ${meta.difficulty},`,
    `    duration: ${meta.duration},`,
    `    category: '${meta.category}',`,
    meta.theme   ? `    theme: '${meta.theme}',`  : null,
    `    tags: [${meta.tags.map(t => `'${t}'`).join(', ')}],`,
    meta.season  ? `    season: '${meta.season}',` : null,
    meta.event   ? `    event: '${meta.event}',`   : null,
    `    tools: [${meta.tools.map(t => `'${t}'`).join(', ')}],`,
    `    activityIdeas: [`,
    ...meta.activityIdeas.map(a => `      '${a}',`),
    `    ],`,
    `    imageUrl: '${savedPath}',`,
    `    illustUrl: '${savedPath}',`,
    `    illustVersion: 1,`,
    `    imageStatus: 'pending_review',`,
    `    pdfUrl: '',`,
    `    createdAt: '${new Date().toISOString().split('T')[0]}',`,
    `    popular: false,`,
    `  },`,
  ]
  return lines.filter(l => l !== null).join('\n')
}
