import './adult.css'

export const metadata = {
  title: {
    default: 'おとなのぬりえ | 写実・曼荼羅・植物の本格塗り絵',
    template: '%s | おとなのぬりえ',
  },
  description: '大人・シニアのための本格塗り絵プリント。曼荼羅・植物画・風景・幾何模様など、心を整える時間にぴったりの線画を無料配布しています。',
  alternates: { canonical: 'https://nurie-print.com/adult' },
}

export default function AdultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-audience="adult" className="adult-section">
      {children}
    </div>
  )
}
