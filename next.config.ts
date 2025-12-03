import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用靜態優化以避免緩存問題
  experimental: {
    // 確保 API 路由不會被緩存
    forceSwcTransforms: true,
  },
  
  // 設定標頭以控制緩存
  async headers() {
    return [
      {
        // 對所有 API 路由應用無緩存標頭
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
