-- 檢查部署環境數據庫結構的 SQL 查詢
-- 請在部署環境的 Supabase SQL 編輯器中執行

-- 1. 檢查 food_calculation_cats 表是否存在
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'food_calculation_cats'
) AS table_exists;

-- 2. 檢查表結構
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'food_calculation_cats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. 檢查索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'food_calculation_cats'
AND schemaname = 'public';

-- 4. 檢查 RLS 是否啟用
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'food_calculation_cats'
AND schemaname = 'public';

-- 5. 檢查 RLS 政策
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'food_calculation_cats'
AND schemaname = 'public';

-- 6. 檢查現有的關聯記錄數量
SELECT COUNT(*) as association_count
FROM public.food_calculation_cats;

-- 7. 檢查 carbohydrate_calorie_ratio 欄位是否存在
SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'food_calculations'
    AND column_name = 'carbohydrate_calorie_ratio'
    AND table_schema = 'public'
) AS carb_ratio_column_exists;