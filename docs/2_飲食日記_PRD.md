# 飲食日記系統 - 功能需求文檔 (PRD)

## 1. 功能概述

**優先級：P1（高）**

### 功能描述
詳細記錄每日飲食攝取，包含餵食時間、份量與貓咪反應。幫助飼主了解貓咪的飲食習慣，追蹤營養攝取狀況，並建立科學的餵食管理體系。

### 核心價值
- 建立完整的飲食記錄檔案
- 追蹤營養攝取與健康狀況關聯
- 優化餵食時程與份量控制
- 提供數據支持給獸醫診斷參考

## 2. 詳細功能需求

### 2.1 餵食記錄模組

#### 基本記錄功能
- **餵食時間與頻次**
  - 精確記錄餵食時間（時:分）
  - 自動計算餵食間隔時間
  - 統計每日餵食次數
  - 支援多次少量餵食模式

- **食物種類與品牌**
  - 從已儲存的營養計算記錄中選擇
  - 快速選取常用食品
  - 支援混合餵食記錄
  - 新增臨時食品選項

- **餵食份量管理**
  - 重量記錄（公克）
  - 顆數記錄（乾糧）
  - 罐裝比例記錄（1/4罐、1/2罐等）
  - 自定義計量單位

#### 進階記錄功能
- **貓咪反應評估**
  - 食慾評分（1-5分）
    - 1分：完全拒食
    - 2分：勉強進食
    - 3分：正常進食
    - 4分：積極進食
    - 5分：非常渴望
  - 進食速度評估（緩慢/正常/快速/狼吞虎嚥）
  - 餐後行為記錄（滿足/尋找更多/嘔吐/腹瀉等）

- **剩餘食物管理**
  - 剩餘份量記錄
  - 實際攝取量自動計算
  - 食物浪費統計分析
  - 份量調整建議

### 2.2 飲水記錄模組

#### 飲水量追蹤
- **每日飲水量統計**
  - 手動記錄飲水量
  - 水碗消耗量計算
  - 多個水源統合記錄
  - 飲水提醒功能

#### 水質管理
- **水質類型記錄**
  - 自來水（是否煮沸）
  - 過濾水
  - 礦泉水
  - 蒸餾水
  - 其他特殊水質

#### 飲水習慣分析
- **行為模式識別**
  - 偏好的飲水時間
  - 飲水地點偏好
  - 與餵食時間關聯性
  - 季節性飲水變化

### 2.3 營養統計模組

#### 每日營養統計
- **熱量攝取計算**
  - 基於餵食記錄自動計算
  - 與營養計算記錄資料整合
  - 多種食物混合計算
  - 熱量攝取趨勢圖

- **營養成分累計**
  - 蛋白質攝取量
  - 脂肪攝取量
  - 碳水化合物攝取量
  - 纖維攝取量
  - 礦物質攝取量

#### 營養評估與建議
- **與建議攝取量比較**
  - 基於貓咪年齡、體重計算建議攝取量
  - 實際 vs 建議攝取量對比圖表
  - 營養過剩或不足警示
  - 個人化調整建議

#### 報表生成
- **週營養報表**
  - 每日營養攝取摘要
  - 週平均數據
  - 異常日期標註
  - 改善建議

- **月營養報表**
  - 月度營養趨勢分析
  - 季節性變化觀察
  - 健康指標關聯分析
  - 獸醫諮詢建議

## 3. 用戶介面設計

### 3.1 快速記錄介面
- **一鍵記錄**
  - 常用餵食組合快速按鈕
  - 預設份量快速選擇
  - 時間自動填入（可調整）
  - 簡化流程減少操作步驟

### 3.2 詳細記錄介面
- **完整資訊輸入**
  - 所有欄位完整展示
  - 拍照記錄功能
  - 備註說明欄位
  - 歷史記錄參考

### 3.3 數據視覺化
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

### 4.2 核心功能 API

**餵食記錄 API**
```typescript
// 新增餵食記錄
POST /api/feeding-records
{
  cat_id: string
  feeding_time: string (ISO datetime)
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

// 取得餵食記錄列表
GET /api/feeding-records?cat_id={cat_id}&date_from={date}&date_to={date}

// 更新餵食記錄
PUT /api/feeding-records/{id}

// 刪除餵食記錄
DELETE /api/feeding-records/{id}
```

**營養統計 API**
```typescript
// 取得每日營養摘要
GET /api/nutrition-summary?cat_id={cat_id}&date={date}

// 取得營養趨勢數據
GET /api/nutrition-trends?cat_id={cat_id}&period={week|month}&date_from={date}&date_to={date}

// 取得營養建議
GET /api/nutrition-recommendations?cat_id={cat_id}
```

### 4.3 自動化功能

**營養計算引擎**
- 基於餵食記錄自動計算每日營養攝取
- 與營養計算記錄資料整合
- 混合餵食的營養成分計算
- 實時更新營養統計數據

**智能提醒系統**
- 餵食時間提醒
- 飲水不足警示
- 營養攝取異常通知
- 定期數據備份提醒

## 5. 用戶體驗流程

### 5.1 首次使用流程
1. 用戶進入飲食日記頁面
2. 系統引導設定貓咪基本資料（如未設定）
3. 系統推薦餵食時程設定
4. 進行第一次餵食記錄示範
5. 設定提醒偏好

### 5.2 日常記錄流程
1. 接收餵食時間提醒
2. 快速記錄或詳細記錄選擇
3. 填寫餵食資訊
4. 系統自動計算營養數據
5. 查看當日營養統計

### 5.3 數據分析流程
1. 進入統計分析頁面
2. 選擇分析期間（日/週/月）
3. 查看圖表與趨勢
4. 接收改善建議
5. 匯出報表或分享給獸醫

## 6. 開發時程規劃

### Phase 1 - 基礎功能 (4-6週)
- 餵食記錄核心功能
- 基本營養計算
- 簡單統計圖表
- 資料庫設計與 API

### Phase 2 - 進階功能 (3-4週)
- 飲水記錄模組
- 詳細營養分析
- 報表生成系統
- 照片上傳功能

### Phase 3 - 優化功能 (2-3週)
- 智能提醒系統
- 用戶體驗優化
- 性能最佳化
- 錯誤處理完善

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
- 記錄新增回應時間 < 2秒
- 統計計算完成時間 < 5秒
- 資料同步成功率 > 99%

此飲食日記系統將成為貓咪健康管理的重要工具，提供科學化的飲食追蹤與分析功能，幫助飼主更好地照護愛貓的營養需求。