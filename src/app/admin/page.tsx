/**
 * /admin — イラスト素材管理ページ
 *
 * ⚠️ 本番環境では Basic Auth や環境変数チェックで保護すること
 *    例: ADMIN_SECRET を URL パラメータ or middleware で確認
 */
import Image from 'next/image'
import { materials } from '@/lib/data'
import {
  IMAGE_STATUS_LABELS,
  IMAGE_STATUS_COLOR,
  type ImageStatus,
} from '@/lib/types'

export const metadata = {
  title: '素材管理 | ぬりえプリント Admin',
  robots: { index: false, follow: false },  // 検索エンジンから除外
}

// ステータス別の集計
function countByStatus(status: ImageStatus | 'placeholder') {
  return materials.filter(m => (m.imageStatus ?? 'placeholder') === status).length
}

export default function AdminPage() {
  const stats = {
    total: materials.length,
    placeholder: countByStatus('placeholder'),
    pending: countByStatus('pending_review'),
    approved: countByStatus('approved'),
    needs_revision: countByStatus('needs_revision'),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🖼️ イラスト素材管理</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              AIイラストの配置・レビュー・差し替えを管理します
            </p>
          </div>
          <div className="text-xs text-gray-400 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
            ⚠️ 管理者専用ページ
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <StatCard label="教材総数" value={stats.total} color="bg-blue-50 text-blue-700 border-blue-200" />
          <StatCard label="SVGのみ" value={stats.placeholder} color="bg-gray-50 text-gray-600 border-gray-200" />
          <StatCard label="レビュー待ち" value={stats.pending} color="bg-yellow-50 text-yellow-700 border-yellow-200" />
          <StatCard label="承認済み" value={stats.approved} color="bg-green-50 text-green-700 border-green-200" />
          <StatCard label="要修正" value={stats.needs_revision} color="bg-red-50 text-red-700 border-red-200" />
        </div>

        {/* 命名規則リファレンス */}
        <details className="mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <summary className="px-5 py-3.5 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
            📋 ファイル命名規則・差し替え手順
          </summary>
          <div className="px-5 py-4 border-t border-gray-100 text-sm text-gray-700 space-y-3">
            <div>
              <p className="font-semibold text-gray-900 mb-1">ファイルパス規則</p>
              <code className="block bg-gray-50 rounded p-3 text-xs leading-relaxed font-mono text-gray-800">
                {`public/materials/\n`}
                {`  {id}.svg              # 印刷用SVG線画（常に必須）\n`}
                {`  {id}-illust.jpg       # AIイラスト（1280×960px推奨）\n`}
                {`  {id}-illust-v2.jpg    # リビジョン（旧版を残す場合）\n`}
                {`  {id}-thumb.jpg        # サムネイル（400×300px）`}
              </code>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">差し替え手順</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded">public/materials/{'{id}'}-illust.jpg</code> を上書き保存</li>
                <li><code className="bg-gray-100 px-1 rounded">src/lib/data.ts</code> の該当エントリの <code className="bg-gray-100 px-1 rounded">imageStatus</code> を <code className="bg-gray-100 px-1 rounded">&apos;pending_review&apos;</code> に変更</li>
                <li><code className="bg-gray-100 px-1 rounded">illustVersion</code> を +1、<code className="bg-gray-100 px-1 rounded">illustNotes</code> に変更理由を記載</li>
                <li>このページで確認 → <code className="bg-gray-100 px-1 rounded">approved</code> に変更してコミット</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">AI生成プロンプトのベース</p>
              <code className="block bg-gray-50 rounded p-3 text-xs font-mono text-gray-800 leading-relaxed">
                {`フラットイラスト、明るいパステル調、白背景\n`}
                {`日本の保育園・幼稚園向けWebサイト用サムネイル\n`}
                {`1280×960px、子ども向けで親しみやすいタッチ\n`}
                {`テーマ: {title}`}
              </code>
            </div>
          </div>
        </details>

        {/* 教材一覧テーブル */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-900">教材一覧（{materials.length}件）</h2>
            <p className="text-xs text-gray-400">data.ts を編集してステータスを更新してください</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-medium">プレビュー</th>
                  <th className="px-4 py-3 text-left font-medium">ID / タイトル</th>
                  <th className="px-4 py-3 text-left font-medium">ステータス</th>
                  <th className="px-4 py-3 text-left font-medium">イラストファイル</th>
                  <th className="px-4 py-3 text-left font-medium">Ver.</th>
                  <th className="px-4 py-3 text-left font-medium">メモ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map(m => {
                  const status = m.imageStatus ?? 'placeholder'
                  const badgeClass = IMAGE_STATUS_COLOR[status]
                  const hasIllust = !!m.illustUrl
                  const expectedFile = `/materials/${m.id}-illust.jpg`

                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      {/* プレビュー */}
                      <td className="px-4 py-3">
                        <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                          {hasIllust ? (
                            <Image
                              src={m.illustUrl!}
                              alt={m.title}
                              width={64}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : m.imageUrl.endsWith('.svg') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.imageUrl}
                              alt={m.title}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-2xl">🖼️</span>
                          )}
                        </div>
                      </td>

                      {/* ID / タイトル */}
                      <td className="px-4 py-3">
                        <a
                          href={`/materials/${m.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-blue-600 hover:underline"
                        >
                          {m.id}
                        </a>
                        <p className="text-xs text-gray-700 mt-0.5 max-w-[200px]">{m.title}</p>
                      </td>

                      {/* ステータス */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
                          {IMAGE_STATUS_LABELS[status]}
                        </span>
                      </td>

                      {/* イラストファイル */}
                      <td className="px-4 py-3">
                        {hasIllust ? (
                          <code className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                            {m.illustUrl}
                          </code>
                        ) : (
                          <code className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                            {expectedFile}
                          </code>
                        )}
                      </td>

                      {/* バージョン */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {m.illustVersion ? `v${m.illustVersion}` : '—'}
                      </td>

                      {/* メモ */}
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px]">
                        {m.illustNotes ?? (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* フッターガイド */}
        <p className="mt-6 text-xs text-center text-gray-400">
          ステータスの変更は <code className="bg-gray-100 px-1 rounded">src/lib/data.ts</code> を直接編集してください。将来的にAPIエンドポイントで更新可能にする予定です。
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl border p-4 text-center ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 font-medium opacity-80">{label}</p>
    </div>
  )
}
