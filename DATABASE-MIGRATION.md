# 資料庫遷移指引

## 問題說明
應用程式新增了貓咪頭像選擇和生日輸入功能，但資料庫 `cats` 表中缺少對應的欄位：
- `avatar_id` - 貓咪頭像 ID
- `birthday` - 貓咪生日

## 解決方案

### 方式一：執行遷移 SQL（推薦）
1. 連線到你的 Supabase 資料庫
2. 在 SQL Editor 中執行 `migration-add-cat-fields.sql` 檔案內容
3. 重啟應用程式

### 方式二：手動執行 SQL 指令
在 Supabase Dashboard 的 SQL Editor 中執行以下指令：

```sql
-- 添加 avatar_id 欄位
ALTER TABLE public.cats 
ADD COLUMN IF NOT EXISTS avatar_id VARCHAR(20) DEFAULT 'cat-1';

-- 添加 birthday 欄位
ALTER TABLE public.cats 
ADD COLUMN IF NOT EXISTS birthday DATE;

-- 更新現有記錄的預設頭像
UPDATE public.cats 
SET avatar_id = 'cat-1' 
WHERE avatar_id IS NULL;
```

### 方式三：重新建立資料庫
如果是開發環境且不介意清除現有資料：
1. 刪除現有的 `cats` 和 `food_calculations` 表
2. 重新執行 `supabase-schema.sql` 檔案

## 驗證遷移
遷移完成後，應該可以：
1. ✅ 新增貓咪時選擇頭像
2. ✅ 輸入貓咪生日並自動計算年齡
3. ✅ 編輯現有貓咪的資料
4. ✅ 在貓咪卡片中看到選擇的頭像

## 注意事項
- 遷移是向後相容的，不會影響現有資料
- 新欄位都有預設值，舊資料仍可正常顯示
- 如果遷移失敗，應用程式會降級為只使用基本欄位