import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用靜態優化以避免緩存問題
  experimental: {
    // 確保 API 路由不會被緩存
    forceSwcTransforms: true,
  },

  // 使用 Git commit hash 作為穩定的 build ID
  generateBuildId: async () => {
    // 在生產環境使用 Git commit hash，確保相同代碼生成相同的 build ID
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 12)
    }
    
    // 開發環境回退到預設值
    return null
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
