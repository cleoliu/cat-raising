# 資料庫遷移指引

## 問題說明
應用程式新增了以下功能，需要更新資料庫結構：

### 1. 貓咪頭像和生日功能
資料庫 `cats` 表中缺少對應的欄位：
- `avatar_id` - 貓咪頭像 ID
- `birthday` - 貓咪生日

### 2. 熱量比分析功能
資料庫 `food_calculations` 表中缺少對應的欄位：
- `carbohydrate_calorie_ratio` - 碳水化合物熱量比

### 3. 多貓咪關聯功能
需要建立 `food_calculation_cats` 多對多關聯表

## 解決方案

### 方式一：執行遷移 SQL（推薦）
1. 連線到你的 Supabase 資料庫
2. 在 SQL Editor 中依序執行以下遷移檔案：
   - `migration-add-cat-fields.sql` - 貓咪頭像和生日欄位
   - `migration-add-new-columns.sql` - 產品資訊欄位
   - `migration-multiple-cats.sql` - 多貓咪關聯表
   - `migration-add-calorie-fields.sql` - 熱量分析欄位
3. 重啟應用程式

### 方式二：手動執行 SQL 指令
在 Supabase Dashboard 的 SQL Editor 中執行以下指令：

```sql
-- 1. 添加貓咪頭像和生日欄位
ALTER TABLE public.cats 
ADD COLUMN IF NOT EXISTS avatar_id VARCHAR(20) DEFAULT 'cat-1';

ALTER TABLE public.cats 
ADD COLUMN IF NOT EXISTS birthday DATE;

-- 2. 添加產品資訊欄位
ALTER TABLE public.food_calculations 
ADD COLUMN IF NOT EXISTS carbohydrate_percent DECIMAL(5,2) 
CHECK (carbohydrate_percent >= 0 AND carbohydrate_percent <= 100);

ALTER TABLE public.food_calculations 
ADD COLUMN IF NOT EXISTS target_age VARCHAR(20);

ALTER TABLE public.food_calculations 
ADD COLUMN IF NOT EXISTS food_type VARCHAR(20);

-- 3. 添加熱量分析欄位
ALTER TABLE public.food_calculations 
ADD COLUMN IF NOT EXISTS carbohydrate_calorie_ratio DECIMAL(5,2);

-- 4. 建立多貓咪關聯表
CREATE TABLE IF NOT EXISTS public.food_calculation_cats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_calculation_id UUID REFERENCES public.food_calculations(id) ON DELETE CASCADE NOT NULL,
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(food_calculation_id, cat_id)
);

-- 5. 建立索引
CREATE INDEX IF NOT EXISTS idx_food_calculation_cats_food_id ON public.food_calculation_cats(food_calculation_id);
CREATE INDEX IF NOT EXISTS idx_food_calculation_cats_cat_id ON public.food_calculation_cats(cat_id);

-- 6. 啟用RLS
ALTER TABLE public.food_calculation_cats ENABLE ROW LEVEL SECURITY;

-- 7. 建立RLS政策
CREATE POLICY "Users can view own cat associations" ON public.food_calculation_cats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.food_calculations fc 
            WHERE fc.id = food_calculation_id AND fc.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own cat associations" ON public.food_calculation_cats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.food_calculations fc 
            WHERE fc.id = food_calculation_id AND fc.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own cat associations" ON public.food_calculation_cats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.food_calculations fc 
            WHERE fc.id = food_calculation_id AND fc.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own cat associations" ON public.food_calculation_cats
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.food_calculations fc 
            WHERE fc.id = food_calculation_id AND fc.user_id = auth.uid()
        )
    );

-- 8. 遷移現有數據
INSERT INTO public.food_calculation_cats (food_calculation_id, cat_id)
SELECT id, cat_id 
FROM public.food_calculations 
WHERE cat_id IS NOT NULL;

-- 9. 更新現有記錄的預設頭像
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

### 貓咪功能
1. ✅ 新增貓咪時選擇頭像
2. ✅ 輸入貓咪生日並自動計算年齡
3. ✅ 編輯現有貓咪的資料
4. ✅ 在貓咪卡片中看到選擇的頭像

### 熱量分析功能
5. ✅ 在計算器中輸入熱量數據 (kcal/100g)
6. ✅ 查看蛋白質熱量比、脂肪熱量比、碳水熱量比
7. ✅ 在產品頁面看到熱量比指標
8. ✅ 編輯現有記錄時可以修改熱量數據

### 多貓咪關聯功能
9. ✅ 在計算器中選擇多隻貓咪
10. ✅ 在產品頁面看到關聯的貓咪標籤
11. ✅ 按貓咪篩選產品記錄

## 注意事項
- 遷移是向後相容的，不會影響現有資料
- 新欄位都有預設值，舊資料仍可正常顯示
- 如果遷移失敗，應用程式會降級為只使用基本欄位