# 🚀 Cat-Raising 部署指南

本指南將協助您完整部署 Cat-Raising 應用程式到生產環境。

## 📋 部署前檢查清單

### 必要檔案確認

- [ ] ✅ 所有原始碼已提交到 Git
- [ ] ✅ 環境變數檔案已設置（不要提交 `.env.local`）
- [ ] ✅ 資料庫遷移腳本已準備完成
- [ ] ✅ 靜態資源檔案已放置正確位置

### 靜態資源檢查

確認以下檔案存在於 `public/` 目錄：

```
public/
├── cats/
│   ├── cat-0.png     # 白色小貓
│   ├── cat-1.png     # 暹羅貓
│   ├── ...
│   └── cat-15.png    # 共16個貓咪頭像
├── icons/            # PWA 圖標 (見 PWA-ICONS-GUIDE.md)
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── hero-cover.png    # 首頁封面圖
├── manifest.json     # PWA manifest
└── sw.js            # Service Worker
```

## 🗄️ 資料庫設置

### 1. 建立 Supabase 專案

1. 前往 [Supabase Console](https://supabase.com/dashboard)
2. 點擊 "New Project"
3. 填寫專案資訊：
   ```
   Name: cat-raising
   Database Password: [設置強密碼]
   Region: [選擇最近區域]
   ```
4. 等待專案建立完成（約 2-3 分鐘）

### 2. 執行資料庫 Schema

1. 在 Supabase Dashboard 點擊左側 "SQL Editor"
2. 複製根目錄的 `supabase-schema.sql` 檔案的所有內容
3. 貼上到 SQL Editor 並點擊 "Run"
4. 確認所有表格和政策建立成功

> 📄 **supabase-schema.sql 包含以下內容：**
>
> - 用戶表和貓咪表的完整結構
> - 營養計算記錄表（包含所有營養成分和計算結果欄位）
> - 多貓關聯表 (food_calculation_cats)
> - 完整的 RLS 政策和索引
> - 自動更新時間戳的觸發器
> - 用戶註冊自動建立記錄的觸發器

### 3. 設置認證

1. 在 Supabase Dashboard 前往 "Authentication" → "Settings"
2. 在 "Site URL" 設置您的網域：`https://your-domain.vercel.app`
3. 在 "Redirect URLs" 新增：`https://your-domain.vercel.app/dashboard`
4. 啟用需要的登入方式（Email + Google OAuth）

### 4. 獲取連線資訊

從 "Project Settings" → "Data API" → "Project URL" 複製：

- `NEXT_PUBLIC_SUPABASE_URL`

從 "Project Settings" → "API Keys" → "Publishable key" 複製：

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🌐 Vercel 部署

### 1. 準備 GitHub Repository

```bash
# 確保所有變更已提交
git add .
git commit -m "準備生產部署"
git push origin main
```

### 2. 匯入到 Vercel

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Import Project"
3. 選擇您的 GitHub repository
4. 設置專案：
   ```
   Project Name: cat-raising
   Framework: Next.js
   Root Directory: ./
   ```

### 3. 設置環境變數

在 Vercel 專案設置中新增：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 部署設置

```json
// vercel.json (可選，用於自訂設置)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 5. 執行部署

點擊 "Deploy" 按鈕，Vercel 將：

1. 下載您的程式碼
2. 安裝依賴套件
3. 建構應用程式
4. 部署到全球 CDN

## ✅ 部署後驗證

### 1. 功能測試

訪問您的網站並測試：

- [ ] ✅ 首頁載入正常
- [ ] ✅ 使用者註冊/登入
- [ ] ✅ Google OAuth 登入
- [ ] ✅ 新增貓咪（包含頭像選擇）
- [ ] ✅ 營養計算功能
- [ ] ✅ 多貓關聯功能
- [ ] ✅ 編輯和刪除記錄
- [ ] ✅ 懸浮按鈕功能
- [ ] ✅ 響應式設計（手機/桌面）
- [ ] ✅ PWA 安裝提示顯示正常
- [ ] ✅ 應用程式可安裝到主畫面
- [ ] ✅ 離線基本功能運作
- [ ] ✅ Service Worker 註冊成功

### 2. PWA 功能測試

#### 桌面瀏覽器 (Chrome/Edge)

- [ ] ✅ 地址欄顯示安裝圖標
- [ ] ✅ 點擊安裝後可使用獨立視窗
- [ ] ✅ 開發者工具顯示 PWA 資訊正常

#### Android 設備

- [ ] ✅ Chrome 顯示 "安裝應用程式" 選項
- [ ] ✅ 安裝後主畫面顯示應用程式圖標
- [ ] ✅ 啟動為全螢幕應用程式

#### iOS 設備

- [ ] ✅ Safari 分享選單有 "加入主畫面" 選項
- [ ] ✅ 加入後主畫面顯示圖標
- [ ] ✅ 啟動時隱藏 Safari 介面

### 3. 資料庫連線測試

在 Supabase Dashboard 檢查：

- 表格建立成功
- RLS 政策運作正常
- 即時更新功能

## 🔧 常見問題排解

### 建構錯誤

```bash
# 本地測試建構
npm run build

# 檢查 TypeScript 錯誤
npm run type-check
```

### 環境變數問題

確保 Vercel 中的環境變數：

1. 名稱正確（NEXT*PUBLIC* 前綴）
2. 值沒有多餘空格
3. 已重新部署以套用變更

### 資料庫連線問題

1. 檢查 Supabase URL 和 Key 是否正確
2. 確認 RLS 政策已正確設置
3. 檢查 CORS 設置

### 多貓關聯功能問題

如果遇到「部分貓咪關聯保存失敗」錯誤：

1. **診斷問題**：訪問 `/debug` 頁面檢查詳細錯誤
2. **執行 RLS 修復**：在 Supabase SQL 編輯器中執行 `migration/fix-rls-policy.sql`

### 圖片載入問題

確認 `public/cats/` 目錄中有所有 16 個貓咪頭像：

- cat-0.png 到 cat-15.png
- 檔案大小合理（建議 < 100KB）

## 🚀 生產環境最佳化

### 1. 效能最佳化

```typescript
// next.config.js
const nextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000,
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### 2. SEO 設置

確認每個頁面都有適當的：

- `<title>` 標籤
- Meta description
- Open Graph 標籤

### 3. 監控設置

考慮整合：

- Vercel Analytics
- Sentry (錯誤追蹤)
- Google Analytics

## 📊 部署後維護

### 定期檢查

- 每週檢查應用程式狀態
- 監控 Supabase 使用量
- 檢查 Vercel 效能指標

### 備份策略

- Supabase 會自動備份
- 重要設定變更前先匯出資料
- 程式碼變更使用 Git 版本控制

### 更新流程

1. 在開發分支測試新功能
2. 合併到 main 分支
3. Vercel 自動重新部署
4. 驗證生產環境功能

---

🎉 **恭喜！您的 Cat-Raising 應用程式已成功部署！**

如有問題，請檢查 Vercel 和 Supabase 的控制台日誌以進行除錯。
