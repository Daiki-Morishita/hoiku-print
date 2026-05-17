'use client'

import { useEffect } from 'react'
import { Printer } from 'lucide-react'
import type { Material } from '@/lib/types'

export function PrintAllClient({ materials }: { materials: Material[] }) {
  useEffect(() => {
    // Auto-trigger print dialog after images load
    const t = setTimeout(() => window.print(), 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: economy;
            print-color-adjust: economy;
          }
          .print-page {
            filter: grayscale(100%) contrast(1) !important;
            page-break-after: always;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          .screen-only { display: none !important; }
        }
      `}</style>

      {/* Screen-only header */}
      <div className="screen-only max-w-2xl mx-auto px-6 py-8 text-center">
        <div className="font-rounded font-bold text-[12px] text-primary mb-1 tracking-[0.1em]">
          PRINT ALL
        </div>
        <h1 className="font-rounded text-[24px] font-black mb-3">{materials.length} 枚をまとめて印刷</h1>
        <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
          印刷ダイアログが自動で開きます。<br />
          開かない場合は下のボタンを押してください。
        </p>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-full text-[14px] font-rounded font-black hover:opacity-90 transition-colors shadow-md"
        >
          <Printer className="w-4 h-4" />
          印刷ダイアログを開く
        </button>
        <p className="text-[11px] text-muted-foreground mt-6">
          A4横長・モノクロで自動最適化されます
        </p>

        {/* Preview list */}
        <div className="mt-10 grid grid-cols-3 sm:grid-cols-4 gap-3 text-left">
          {materials.map((m, i) => (
            <div key={m.id} className="bg-white border border-border rounded p-2">
              <div className="aspect-[1.414/1] bg-background flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.imageUrl} alt={m.title} className="w-full h-full object-contain" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1">
                {i + 1}. {m.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Print pages — one A4 landscape per material */}
      {materials.map((m) => (
        <div
          key={m.id}
          className="print-page hidden print:block"
          style={{
            position: 'relative',
            width: '297mm',
            height: '210mm',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5mm' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.imageUrl}
              alt={m.title}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{
            position: 'absolute', right: '8mm', bottom: '5mm',
            backgroundColor: '#eeeeee', padding: '0.5mm 1.5mm', borderRadius: '1mm',
            fontSize: '9pt', color: '#333', letterSpacing: '0.05em',
            display: 'flex', alignItems: 'center', gap: '0.4em',
          }}>
            <span>{m.title}</span>
            <span style={{ color: '#aaa' }}>｜</span>
            <span>ぬりえプリント</span>
          </div>
        </div>
      ))}
    </>
  )
}
