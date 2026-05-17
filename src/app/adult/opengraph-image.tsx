import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'おとなのぬりえ — 一日の終わりに、一枚だけ。'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function AdultOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F3EFE6',
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
        <div style={{
          fontSize: 18,
          color: '#2D5043',
          letterSpacing: '0.4em',
          marginBottom: 36,
        }}>
          — A QUIET HOUR —
        </div>

        <div style={{
          fontSize: 88,
          fontWeight: 900,
          color: '#1E2A28',
          marginBottom: 18,
          letterSpacing: '0.03em',
          lineHeight: 1.2,
          display: 'flex',
        }}>
          一日の終わりに、
        </div>
        <div style={{
          fontSize: 88,
          fontWeight: 900,
          color: '#2D5043',
          marginBottom: 40,
          letterSpacing: '0.03em',
          lineHeight: 1.2,
          display: 'flex',
        }}>
          一枚だけ。
        </div>

        <div style={{ fontSize: 24, color: '#5A6864', marginBottom: 8, display: 'flex' }}>
          曼荼羅・植物画・風景・幾何模様
        </div>
        <div style={{ fontSize: 22, color: '#1E2A28', fontWeight: 700, display: 'flex' }}>
          おとなのぬりえ
        </div>

        <div style={{
          position: 'absolute',
          top: 40,
          right: 60,
          fontSize: 16,
          color: '#2D5043',
          letterSpacing: '0.2em',
          display: 'flex',
        }}>
          NURIE PRINT × ADULT
        </div>
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: 60,
          fontSize: 14,
          color: '#5A6864',
          display: 'flex',
        }}>
          nurie-print.com/adult
        </div>
      </div>
    ),
    size
  )
}
