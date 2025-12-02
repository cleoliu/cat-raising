# 數據庫遷移指南

## 遷移執行順序

為了支持新的多貓關聯功能，請按照以下順序執行遷移：

### 1. 基礎結構
確保 `supabase-schema.sql` 已經執行，建立基礎表結構。

### 2. 添加貓咪欄位
```sql
-- migration-add-cat-fields.sql
-- 為貓咪添加 birthday 和 avatar_id 欄位
```

### 3. 添加新計算欄位
```sql
-- migration-add-new-columns.sql
-- 為 food_calculations 添加額外的營養成分欄位
```

### 4. 添加熱量比欄位
```sql
-- migration-add-calorie-fields.sql
-- 添加 carbohydrate_calorie_ratio 欄位
```

### 5. 建立多貓關聯表（重要！）
```sql
-- migration-multiple-cats.sql
-- 建立 food_calculation_cats 關聯表
-- 遷移現有的 cat_id 數據到新的關聯表
```

## 遷移說明

### 多貓關聯功能
- 新的實現方式使用關聯表 `food_calculation_cats` 來支持一個食品記錄關聯多隻貓咪
- 每個食品計算記錄現在可以與多隻貓咪關聯，而不是只能指定一隻貓咪
- 原有的 `food_calculations.cat_id` 欄位保留為 NULL，所有貓咪關聯都透過新的關聯表管理

### 用戶介面改變
- 食品計算頁面現在支援多選貓咪（複選框）
- 記錄頁面會顯示每個食品記錄關聯的所有貓咪
- 保持向後兼容，沒有選擇貓咪的記錄仍然可以正常工作

### 資料遷移
`migration-multiple-cats.sql` 會自動將現有的 `cat_id` 資料遷移到新的關聯表中，確保數據不會丟失。

## 執行方式

在 Supabase 控制台的 SQL 編輯器中，依序執行上述遷移文件。