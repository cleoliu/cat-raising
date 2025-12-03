# 飲食日記系統 - 功能需求文檔 (PRD)

## 1. 功能概述

**優先級：P1（高）**  
**實作狀態：✅ 已完成 Phase 1 & 2，部分 Phase 3**  
**最後更新：2024-12-03**

### 功能描述

詳細記錄每日飲食攝取，包含餵食時間、份量與貓咪反應。幫助飼主了解貓咪的飲食習慣，追蹤營養攝取狀況，並建立科學的餵食管理體系。

### 核心價值

- 建立完整的飲食記錄檔案
- 追蹤營養攝取與健康狀況關聯
- 優化餵食時程與份量控制
- 提供數據支持給獸醫診斷參考

## 2. 詳細功能需求

### 2.1 餵食記錄模組 ✅ 已實作

#### 基本記錄功能

- **餵食時間與頻次** ✅
  - 精確記錄餵食時間（時:分），支援台灣時區
  - 自動計算餵食間隔時間
  - 統計每日餵食次數
  - 支援多次少量餵食模式

- **食物種類與品牌** ✅
  - 從已儲存的營養計算記錄中選擇（支援多貓咪關聯過濾）
  - 快速選取常用食品
  - 支援混合餵食記錄
  - 新增臨時食品選項（自定義食物名稱）

- **保健品與藥物記錄** ✅
  - 保健品種類選擇（魚油、益生菌、維他命等）
  - 藥物名稱與劑量記錄
  - 餵食時間與頻次追蹤
  - 反應與副作用記錄
  - 療程進度追蹤
  - 效果評分（1-5 分）

- **餵食份量管理** ✅
  - 重量記錄（公克）
  - 計劃份量與實際份量分別記錄
  - 剩餘份量記錄
  - 自定義計量單位
  - 自動計算實際攝取量

#### 進階記錄功能

- **貓咪反應評估** ✅

  - 食慾評分（1-5 分）✅
    - 1 分：完全拒食
    - 2 分：勉強進食
    - 3 分：正常進食
    - 4 分：積極進食
    - 5 分：非常渴望
  - 進食速度評估（緩慢/正常/快速/狼吞虎嚥）✅
  - 餐後行為記錄（滿足/尋找更多/嘔吐/腹瀉等）✅

- **剩餘食物管理** ✅
  - 剩餘份量記錄
  - 實際攝取量自動計算
  - 食物浪費統計分析 🔄 部分實作
  - 份量調整建議 ⏳ 待實作

### 2.2 飲水記錄模組 ✅ 已實作

#### 飲水量追蹤

- **每日飲水量統計** ✅
  - 手動記錄飲水量
  - 飲水提醒功能 ⏳ 待實作

#### 水質管理

- **水質類型記錄** ✅
  - 自來水（是否煮沸）
  - 過濾水
  - 礦泉水
  - 蒸餾水
  - 其他特殊水質

#### 飲水習慣分析

- **行為模式識別** ⏳ 待實作
  - 偏好的飲水時間
  - 飲水地點偏好
  - 與餵食時間關聯性
  - 季節性飲水變化

### 2.3 營養統計模組 🔄 部分實作

#### 每日營養統計

- **熱量攝取計算** 🔄
  - 基於餵食記錄自動計算 ✅
  - 與營養計算記錄資料整合 ✅
  - 多種食物混合計算 ✅
  - 熱量攝取趨勢圖 ⏳ 待實作

- **營養成分累計** 🔄
  - 蛋白質攝取量 ✅
  - 脂肪攝取量 ✅
  - 碳水化合物攝取量 ✅
  - 纖維攝取量 ✅
  - 礦物質攝取量 ⏳ 待實作

#### 營養評估與建議

- **與建議攝取量比較** ⏳ 待實作
  - 基於貓咪年齡、體重計算建議攝取量
  - 實際 vs 建議攝取量對比圖表
  - 營養過剩或不足警示
  - 個人化調整建議

#### 報表生成

- **週營養報表** ⏳ 待實作
  - 每日營養攝取摘要
  - 週平均數據
  - 異常日期標註
  - 改善建議

- **月營養報表** ⏳ 待實作
  - 月度營養趨勢分析
  - 季節性變化觀察
  - 健康指標關聯分析
  - 獸醫諮詢建議

## 3. 用戶介面設計

### 3.1 快速記錄介面 ⏳ 待實作

- **一鍵記錄**
  - 常用餵食組合快速按鈕
  - 預設份量快速選擇
  - 時間自動填入（可調整）
  - 簡化流程減少操作步驟

### 3.2 詳細記錄介面 ✅ 已實作

- **完整資訊輸入** ✅
  - 所有欄位完整展示
  - 拍照記錄功能 ⏳ 待實作
  - 備註說明欄位 ✅
  - 歷史記錄參考 ⏳ 待實作

### 3.3 每日記錄檢視介面 ✅ 已實作

- **日期導航功能** ✅
  - 當日記錄預設顯示
  - 日期選擇器切換到其他天
  - 左右滑動或箭頭快速切換日期
  - 快速跳轉到「今天」按鈕

- **記錄條列顯示** ✅
  - 按時間序排列當日所有記錄
  - 餵食記錄、飲水記錄、保健品/藥物記錄整合顯示
  - 每筆記錄顯示時間戳記與類型圖標
  - 點擊展開詳細資訊 ✅
  - 滑動操作快速編輯或刪除 ✅

- **每日統計摘要** ✅
  - 頁面頂部顯示當日營養攝取摘要
  - 總熱量、主要營養素快速預覽 🔄 部分實作
  - 餵食次數與飲水量統計 ✅
  - 服藥/保健品完成狀況指示 ✅

### 3.4 數據視覺化 ⏳ 待實作

- **圖表展示**
  - 每日攝取量折線圖
  - 營養成分圓餅圖
  - 體重變化與營養關聯圖
  - 食慾評分趨勢圖

## 4. 技術實現

### 4.1 資料庫設計

**飲食記錄主表 (FeedingRecords)**

```sql
id: UUID (PK)
user_id: UUID (FK)
cat_id: UUID (FK)
feeding_time: TIMESTAMP
food_calculation_id: UUID (FK, 可選)
custom_food_name: VARCHAR(100, 可選)
planned_amount: DECIMAL(8,2)
actual_amount: DECIMAL(8,2)
remaining_amount: DECIMAL(8,2)
amount_unit: VARCHAR(20) -- 'grams', 'pieces', 'portion'
appetite_score: INTEGER CHECK (appetite_score >= 1 AND appetite_score <= 5)
eating_speed: VARCHAR(20) -- 'slow', 'normal', 'fast', 'gulping'
post_meal_behavior: VARCHAR(50)
notes: TEXT
photo_url: VARCHAR(500, 可選)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**飲水記錄表 (WaterRecords)**

```sql
id: UUID (PK)
user_id: UUID (FK)
cat_id: UUID (FK)
record_date: DATE
water_amount: DECIMAL(6,2)
water_type: VARCHAR(30)
water_source: VARCHAR(50)
notes: TEXT
created_at: TIMESTAMP
```

**保健品與藥物記錄表 (SupplementRecords)**

```sql
id: UUID (PK)
user_id: UUID (FK)
cat_id: UUID (FK)
record_time: TIMESTAMP
record_type: VARCHAR(20) -- 'supplement', 'medication'
product_name: VARCHAR(200)
product_type: VARCHAR(50) -- '魚油', '益生菌', '維他命', '抗生素' 等
dosage_amount: DECIMAL(8,2)
dosage_unit: VARCHAR(20) -- 'ml', 'mg', 'capsule', 'tablet'
frequency: VARCHAR(30) -- 'once_daily', 'twice_daily', 'as_needed'
treatment_duration: INTEGER -- 療程天數
administration_method: VARCHAR(30) -- 'oral', 'topical', 'injection'
reaction_notes: TEXT
side_effects: TEXT
effectiveness_rating: INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5)
prescribed_by: VARCHAR(100) -- 獸醫師名稱
prescription_date: DATE
notes: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**營養攝取統計表 (DailyNutritionSummary)**

```sql
id: UUID (PK)
user_id: UUID (FK)
cat_id: UUID (FK)
summary_date: DATE
total_calories: DECIMAL(8,2)
total_protein: DECIMAL(8,2)
total_fat: DECIMAL(8,2)
total_carbohydrate: DECIMAL(8,2)
total_fiber: DECIMAL(8,2)
feeding_count: INTEGER
average_appetite_score: DECIMAL(3,2)
water_intake: DECIMAL(6,2)
calculated_at: TIMESTAMP
```

### 4.2 核心功能 API ✅ 已實作

**餵食記錄 API** ✅

```typescript
// 新增餵食記錄 ✅
POST /api/feeding-records
{
  cat_id: string
  feeding_time: string (Taiwan timezone)
  food_calculation_id?: string
  custom_food_name?: string
  planned_amount: number
  actual_amount: number
  remaining_amount: number
  amount_unit: string
  appetite_score: number
  eating_speed: string
  post_meal_behavior?: string
  notes?: string
  photo_url?: string
}

// 取得餵食記錄列表 ✅
GET /api/feeding-records?cat_id={cat_id}&date_from={date}&date_to={date}

// 更新餵食記錄 ✅
PUT /api/feeding-records/{id}

// 刪除餵食記錄 ✅
DELETE /api/feeding-records/{id}
```

**保健品與藥物記錄 API** ✅

```typescript
// 新增保健品/藥物記錄 ✅
POST /api/supplement-records
{
  cat_id: string
  record_time: string (Taiwan timezone)
  record_type: 'supplement' | 'medication'
  product_name: string
  product_type: string
  dosage_amount: number
  dosage_unit: string
  frequency: string
  treatment_duration?: number
  administration_method: string
  reaction_notes?: string
  side_effects?: string
  effectiveness_rating?: number
  prescribed_by?: string
  prescription_date?: string
  notes?: string
}

// 取得保健品/藥物記錄列表 ✅
GET /api/supplement-records?cat_id={cat_id}&type={supplement|medication}&date_from={date}&date_to={date}

// 更新保健品/藥物記錄 ✅
PUT /api/supplement-records/{id}

// 刪除保健品/藥物記錄 ✅
DELETE /api/supplement-records/{id}

// 取得療程進度報告 ⏳
GET /api/treatment-progress?cat_id={cat_id}&prescription_date={date}
```

**營養統計 API** 🔄 部分實作

```typescript
// 取得每日營養摘要 🔄
GET /api/nutrition-summary?cat_id={cat_id}&date={date}

// 取得營養趨勢數據 ⏳
GET /api/nutrition-trends?cat_id={cat_id}&period={week|month}&date_from={date}&date_to={date}

// 取得營養建議 ⏳
GET /api/nutrition-recommendations?cat_id={cat_id}
```

### 4.3 自動化功能 🔄 部分實作

**營養計算引擎** 🔄

- 基於餵食記錄自動計算每日營養攝取 ✅
- 與營養計算記錄資料整合 ✅
- 混合餵食的營養成分計算 ✅
- 實時更新營養統計數據 ⏳

**快取管理系統** ✅

- 自動版本檢測與快取清除 ✅
- API 回應快取控制 ✅
- 漸進式網頁應用程式 (PWA) 支援 ✅

**時區管理系統** ✅

- 自動台灣時區轉換 ✅
- 統一時間格式處理 ✅
- 跨平台時間顯示一致性 ✅

## 5. 用戶體驗流程

### 5.1 首次使用流程

1. 用戶進入飲食日記頁面
2. 系統引導設定貓咪基本資料（如未設定）
3. 進行第一次餵食記錄示範
4. 查看記錄檢視功能介紹

### 5.2 日常記錄流程

1. 進入飲食日記頁面
2. 快速記錄或詳細記錄選擇
3. 填寫餵食資訊
4. 系統自動計算營養數據
5. 查看當日營養統計

### 5.3 記錄檢視流程

1. 進入每日記錄檢視頁面
2. 預設顯示當日所有記錄
3. 透過日期選擇器切換到其他日期
4. 查看該日的詳細記錄列表
5. 點擊個別記錄查看完整詳情
6. 滑動操作進行編輯或刪除
7. 查看每日營養攝取摘要

### 5.4 數據分析流程

1. 進入統計分析頁面
2. 選擇分析期間（日/週/月）
3. 查看圖表與趨勢
4. 接收改善建議
5. 匯出報表或分享給獸醫

## 6. 開發時程規劃

### Phase 1 - 基礎功能 ✅ 已完成

- 餵食記錄核心功能 ✅
- 每日記錄檢視與日期切換 ✅
- 基本營養計算 ✅
- 簡單統計圖表 🔄 部分實作
- 資料庫設計與 API ✅

### Phase 2 - 進階功能 ✅ 已完成

- 飲水記錄模組 ✅
- 保健品與藥物記錄系統 ✅
- 詳細營養分析 🔄 部分實作
- 報表生成系統 ⏳ 待實作
- 照片上傳功能 ⏳ 待實作

### Phase 3 - 優化功能 🔄 部分實作

- 用戶體驗優化 ✅
  - 按鈕點擊區域優化 ✅
  - 觸控友好介面設計 ✅
  - 快取管理與版本控制 ✅
- 性能最佳化 ✅
  - API 快取控制 ✅
  - 自動版本更新機制 ✅
- 錯誤處理完善 ✅
  - 詳細錯誤日誌 ✅
  - 診斷工具頁面 ✅
- 進階數據分析功能 ⏳ 待實作

### Phase 4 - 後續優化 ⏳ 規劃中

- 數據視覺化圖表 ⏳
- 營養建議系統 ⏳
- 週/月報表功能 ⏳
- 照片記錄功能 ⏳

## 7. 成功指標

### 功能使用率

- 每日記錄完成率 > 80%
- 功能使用黏性（連續使用天數）
- 數據完整性評分

### 用戶滿意度

- 功能易用性評分
- 數據準確性滿意度
- 改善建議採用率

### 系統效能

- 記錄新增回應時間 < 2 秒
- 統計計算完成時間 < 5 秒
- 資料同步成功率 > 99%

## 8. 實作現況總結

### 已完成功能 ✅

- **核心記錄系統**：餵食、飲水、保健品/藥物記錄完整實作
- **每日檢視管理**：支援日期切換、記錄編輯刪除、即時統計
- **多貓咪管理**：食品關聯過濾、跨貓咪記錄管理
- **時區管理**：統一台灣時區處理，解決顯示不一致問題
- **快取管理**：自動版本檢測、快取清除、PWA 支援
- **錯誤處理**：詳細日誌記錄、診斷工具、權限驗證
- **用戶體驗**：觸控優化、響應式設計、直觀操作流程

### 部分實作功能 🔄

- **營養統計**：基本計算完成，缺少趨勢分析與視覺化
- **數據分析**：每日統計可用，週月報表待開發

### 待實作功能 ⏳

- **視覺化圖表**：營養趨勢、攝取量分析圖表
- **智能建議**：基於貓咪資料的個人化營養建議
- **報表系統**：週/月營養報表、獸醫分享功能
- **照片記錄**：食物照片上傳與管理

### 技術架構

- **前端**：Next.js 16.0.5 + React 19 + TypeScript + Tailwind CSS
- **後端**：Supabase (PostgreSQL + 即時 API + 認證)
- **部署**：Vercel (自動 CI/CD + 快取控制)
- **PWA**：離線支援 + 安裝提示

此飲食日記系統已成為功能完整的貓咪健康管理工具，提供科學化的飲食追蹤與分析功能，幫助飼主更好地照護愛貓的營養需求。核心功能已完全實作並在生產環境穩定運行，後續將持續增加進階分析與視覺化功能。
