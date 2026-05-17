import { getMaterialById } from '@/lib/data'
import { PrintAllClient } from './PrintAllClient'

export const metadata = {
  title: 'まとめて印刷',
  robots: { index: false, follow: false },
}

export default async function PrintAllPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const list = (ids ?? '').split(',').filter(Boolean)
  const materials = list
    .map(id => getMaterialById(id))
    .filter((m): m is NonNullable<typeof m> => !!m)

  return <PrintAllClient materials={materials} />
}
