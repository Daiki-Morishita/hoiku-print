import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ぬりえプリント — 先生たちと、子どもたちへ'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAF7F0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Editorial mark */}
        <div style={{
          fontSize: 18,
          color: '#C75C3A',
          letterSpacing: '0.3em',
          marginBottom: 32,
        }}>
          — 今日は何をぬる？ —
        </div>

        {/* Main title */}
        <div style={{
          fontSize: 96,
          fontWeight: 900,
          color: '#3A3A3A',
          marginBottom: 20,
          letterSpacing: '0.02em',
          lineHeight: 1.2,
          display: 'flex',
        }}>
          先生たちと、
        </div>
        <div style={{
          fontSize: 96,
          fontWeight: 900,
          color: '#C75C3A',
          marginBottom: 36,
          letterSpacing: '0.02em',
          lineHeight: 1.2,
          display: 'flex',
        }}>
          子どもたちへ。
        </div>

        {/* Sub */}
        <div style={{ fontSize: 26, color: '#888', marginBottom: 8, display: 'flex' }}>
          保育士・幼稚園教諭のための無料ぬりえプリント
        </div>
        <div style={{ fontSize: 22, color: '#3A3A3A', fontWeight: 700, display: 'flex' }}>
          ぬりえプリント
        </div>

        {/* Corner decoration */}
        <div style={{
          position: 'absolute',
          top: 40,
          right: 60,
          fontSize: 16,
          color: '#C75C3A',
          letterSpacing: '0.2em',
          display: 'flex',
        }}>
          NURIE PRINT
        </div>
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: 60,
          fontSize: 14,
          color: '#888',
          display: 'flex',
        }}>
          nurie-print.com
        </div>
      </div>
    ),
    size
  )
}
