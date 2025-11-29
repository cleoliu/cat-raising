# 貓咪乾物質計算器

一個幫助貓咪飼主計算貓糧乾物質含量的網頁應用程式，基於 Next.js 14 和 Supabase 開發。

## 🚀 快速開始

### 1. 設置 Supabase 資料庫

#### 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com) 並登入/註冊
2. 點擊 "New Project"
3. 選擇組織並填寫專案資訊：
   - Name: `cat-nutrition-calculator`
   - Database Password: 設置安全密碼
   - Region: 選擇最近的區域
4. 等待專案建立完成（約 2-3 分鐘）

#### 執行資料庫 Schema

1. 在 Supabase Dashboard 點擊左側 "SQL Editor"
2. 複製 `supabase-schema.sql` 檔案的所有內容
3. 貼上到 SQL Editor 並點擊 "Run"
4. 確認所有表格建立成功

#### 獲取連線資訊

1. 點擊左側 "Project Settings" → "Data API"
2. 複製以下資訊：
   - `Project URL`
   - `anon public` key

### 2. 設置本地環境

#### 安裝依賴

```bash
npm install
```

#### 配置環境變數

編輯 `.env.local` 檔案：

```env
NEXT_PUBLIC_SUPABASE_URL=你的專案URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
```

#### 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 檢視應用程式。

## 📋 功能特色

- 🧮 **精準計算** - 基於 AAFCO 標準計算乾物質含量
- 🐱 **多貓管理** - 為每隻貓咪建立檔案，支援快速切換
- 📊 **卡片記錄** - 卡片式展示計算記錄，支援篩選和收藏
- 🔄 **智能切換** - 切換貓咪時自動載入歷史資料，一鍵套用
- 📱 **手機優先** - 專為手機瀏覽器優化的淡藍色主題設計
- 🚀 **直接跳轉** - 從貓咪管理直接跳到對應貓咪的記錄頁面
- 🎯 **底部導航** - 簡潔的三頁籤設計：產品、計算機、管理貓咪
- 🆓 **完全免費** - 使用免費的雲端服務

## 🏗️ 技術架構

### 前端

- **框架**: Next.js 14 (React 18) 
- **樣式**: Tailwind CSS (手機優先設計)
- **UI 組件**: Radix UI + shadcn/ui
- **表單**: React Hook Form + Zod
- **導航**: 自定義底部導航組件
- **設計**: 淡藍色漸層主題，圓角卡片設計

### 後端

- **資料庫**: PostgreSQL (Supabase)
- **認證**: Supabase Auth
- **API**: Next.js API Routes

### 部署

- **前端**: Vercel (免費)
- **後端**: Supabase (免費)

## 🧮 計算公式

### 基礎計算

```
乾物質含量 = 100% - 水分含量%
```

### 乾物質基準營養成分

```
乾物質基準蛋白質 = (蛋白質% / 乾物質含量%) × 100%
乾物質基準脂肪 = (脂肪% / 乾物質含量%) × 100%
乾物質基準纖維 = (纖維% / 乾物質含量%) × 100%
```

## 🚀 部署到 Vercel

### 自動部署

1. 將專案推送到 GitHub
2. 前往 [Vercel](https://vercel.com) 並匯入專案
3. 在 Environment Variables 設置：
   ```
   NEXT_PUBLIC_SUPABASE_URL = 你的Supabase URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY = 你的Supabase anon key
   ```
4. 點擊 "Deploy"

## 💰 免費額度

### Vercel 免費方案

- ✅ 每月 100GB 頻寬
- ✅ 無限制靜態網站

### Supabase 免費方案

- ✅ 500MB 資料庫
- ✅ 1GB 檔案儲存
- ✅ 50,000 MAU

**預估支撐**: 1,000-2,000 活躍用戶

## 🔧 開發命令

```bash
# 開發模式
npm run dev

# 建構
npm run build

# 程式碼檢查
npm run lint
```

## 📄 授權

MIT License

---

**⚠️ 免責聲明**: 本工具僅供參考，具體餵食建議請諮詢專業獸醫師。
