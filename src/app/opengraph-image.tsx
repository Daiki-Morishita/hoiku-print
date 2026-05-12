import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ぬりえプリント - 保育士のための無料教材プリント'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #EEF4FB 0%, #FAFAF9 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🖨️</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>
          ぬりえプリント
        </div>
        <div style={{ fontSize: 28, color: '#5B9BD5', fontWeight: 600, marginBottom: 20 }}>
          保育士のための無料教材プリント
        </div>
        <div style={{ fontSize: 22, color: '#6B7280' }}>
          動物・恐竜・乗り物など豊富なテーマ | 年齢・季節別に探せます
        </div>
      </div>
    ),
    size
  )
}
