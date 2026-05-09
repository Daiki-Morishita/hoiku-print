import path from 'node:path'
import { defineConfig } from 'prisma/config'

// ローカル開発時のみ .env.local を読み込む（Vercel は環境変数を直接注入する）
if (process.env.NODE_ENV !== 'production') {
  const { config } = await import('dotenv')
  config({ path: path.join(__dirname, '.env.local') })
}

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
})
