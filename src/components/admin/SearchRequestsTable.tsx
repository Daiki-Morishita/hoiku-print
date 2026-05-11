interface SearchRequest {
  id: string
  query: string
  count: number
  createdAt: Date
  updatedAt: Date
}

interface Props {
  requests: SearchRequest[]
}

export function SearchRequestsTable({ requests }: Props) {
  if (requests.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-sm text-gray-400">
        まだリクエストはありません
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
            <th className="px-4 py-2.5 font-medium">検索ワード</th>
            <th className="px-4 py-2.5 font-medium text-right">検索回数</th>
            <th className="px-4 py-2.5 font-medium text-right">最終検索日</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2.5 font-medium text-gray-800">{r.query}</td>
              <td className="px-4 py-2.5 text-right">
                <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                  {r.count}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right text-xs text-gray-400">
                {new Date(r.updatedAt).toLocaleDateString('ja-JP')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
