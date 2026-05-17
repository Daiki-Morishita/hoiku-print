'use client'

import { useState } from 'react'
import { Store, Download, X, ExternalLink } from 'lucide-react'

interface Props {
  materialId: string
  materialTitle: string
  imageUrl: string
}

const SERVICES = [
  {
    key: '7eleven',
    label: 'セブン-イレブン',
    serviceName: 'ネットプリント',
    stores: 'セブン-イレブン全国',
    color: '#EF4135',
    bg: '#FFE5E5',
    uploadUrl: 'https://www.printing.ne.jp/',
    appNote: 'アプリ「セブン-イレブンマルチコピー」も利用可',
    prices: [
      { label: 'モノクロ A4', value: '20円' },
      { label: 'カラー A4', value: '60円' },
    ],
  },
  {
    key: 'lawson',
    label: 'ローソン・ファミマ等',
    serviceName: 'ネットワークプリント',
    stores: 'ローソン / ファミリーマート / ミニストップ / デイリー / セイコーマート / イオン / マックスバリュ',
    color: '#0B5DA8',
    bg: '#E1ECF7',
    uploadUrl: 'https://networkprint.ne.jp/Lite/',
    appNote: 'アプリ「ネットワークプリント」も利用可',
    prices: [
      { label: 'モノクロ A4', value: '20円' },
      { label: 'カラー A4', value: '60円' },
    ],
  },
] as const

export function ConveniencePrintButton({ materialTitle, imageUrl }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<typeof SERVICES[number]>(SERVICES[0])
  const [downloaded, setDownloaded] = useState(false)

  async function handleDownload() {
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${materialTitle}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDownloaded(true)
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, '_blank')
      setDownloaded(true)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-foreground text-foreground py-3 px-4 rounded-xl font-medium hover:bg-foreground hover:text-background transition-colors"
      >
        <Store className="w-4 h-4" />
        コンビニで印刷する
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl my-8 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-border p-5 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="font-rounded text-[20px] font-black">コンビニで印刷</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  プリンタがなくても、お近くのコンビニで印刷できます
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* STEP 1: Download */}
              <section className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-rounded font-black text-primary text-[14px] bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">1</span>
                  <h3 className="font-rounded font-bold text-[15px]">画像をダウンロード</h3>
                </div>
                <button
                  onClick={handleDownload}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                    downloaded
                      ? 'bg-[#4FA7B8] text-white'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {downloaded ? 'ダウンロード済み（再ダウンロード）' : '画像をダウンロード'}
                </button>
                <p className="text-[11px] text-muted-foreground mt-2 text-center">
                  保存先：写真フォルダ or ダウンロード
                </p>
              </section>

              {/* STEP 2: Service tabs */}
              <section className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-rounded font-black text-primary text-[14px] bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">2</span>
                  <h3 className="font-rounded font-bold text-[15px]">コンビニを選ぶ</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {SERVICES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSelectedService(s)}
                      className={`p-3 rounded-lg border-2 text-[13px] font-rounded font-bold transition-all ${
                        selectedService.key === s.key
                          ? 'border-foreground bg-foreground text-white'
                          : 'border-border bg-white hover:border-foreground/50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div
                  className="rounded-lg p-4 mb-3"
                  style={{ background: selectedService.bg }}
                >
                  <div className="font-rounded font-bold text-[14px] mb-1" style={{ color: selectedService.color }}>
                    {selectedService.serviceName}
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-relaxed mb-3">
                    対象店舗：{selectedService.stores}
                  </p>
                  <div className="flex gap-2 mb-3">
                    {selectedService.prices.map((p) => (
                      <div key={p.label} className="bg-white px-2.5 py-1 rounded text-[11px]">
                        <span className="text-muted-foreground">{p.label}</span>
                        <span className="ml-1.5 font-bold" style={{ color: selectedService.color }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-foreground/70 mb-3">💡 {selectedService.appNote}</p>
                  <a
                    href={selectedService.uploadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-white text-foreground py-2.5 rounded-lg font-medium text-[13px] border-2 hover:opacity-90 transition-colors"
                    style={{ borderColor: selectedService.color }}
                  >
                    {selectedService.serviceName}で予約
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <ol className="text-[12px] text-foreground/80 space-y-1.5 leading-relaxed pl-4 list-decimal">
                  <li>上のリンクから予約ページを開く</li>
                  <li>「ファイル登録（ゲスト・無料）」を選び、保存した画像をアップロード</li>
                  <li>用紙サイズに <strong>A4</strong> ・向きに <strong>横</strong> を選択</li>
                  <li>発行された<strong>予約番号</strong>（8桁）をメモ</li>
                </ol>
              </section>

              {/* STEP 3: Print at store */}
              <section className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-rounded font-black text-primary text-[14px] bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">3</span>
                  <h3 className="font-rounded font-bold text-[15px]">お店のマルチコピー機で印刷</h3>
                </div>
                <ol className="text-[12px] text-foreground/80 space-y-1.5 leading-relaxed pl-4 list-decimal">
                  <li>お近くの {selectedService.label} へ</li>
                  <li>マルチコピー機で「{selectedService.serviceName}」を選ぶ</li>
                  <li>予約番号を入力して印刷スタート</li>
                </ol>
                <p className="text-[11px] text-muted-foreground mt-3">
                  ※ 予約は通常24時間〜7日間有効です（サービスにより異なる）
                </p>
              </section>

              {/* Disclaimer */}
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                ※ 料金・有効期限・操作手順は各サービスの最新情報を必ずご確認ください。<br />
                ぬりえプリントは無料配布サービスで、コンビニ印刷の料金は受け取っておりません。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
