import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 将来の画像最適化に備えてremotePatterns設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hdhogsjmdowevijxooiq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // ターボパック設定（ルート指定で警告を抑制）
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
