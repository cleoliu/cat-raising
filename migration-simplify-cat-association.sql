-- 簡化貓咪關聯：從多對多關聯表改回單一 cat_id 欄位
-- 執行此 SQL 來移除關聯表並遷移資料到 food_calculations.cat_id

-- 第一步：遷移關聯表資料到 food_calculations.cat_id
-- 這將選擇每個 food_calculation 的第一個關聯貓咪
UPDATE public.food_calculations 
SET cat_id = (
    SELECT fcc.cat_id 
    FROM public.food_calculation_cats fcc 
    WHERE fcc.food_calculation_id = food_calculations.id 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 
    FROM public.food_calculation_cats fcc 
    WHERE fcc.food_calculation_id = food_calculations.id
);

-- 第二步：清理重複的記錄
-- 如果同一個 food_calculation 有多個貓咪關聯，我們需要為每個額外的貓咪創建新記錄
WITH duplicate_associations AS (
    SELECT 
        fcc.food_calculation_id,
        fcc.cat_id as association_cat_id,
        fc.user_id, fc.brand_name, fc.product_name, fc.food_weight,
        fc.total_calories, fc.calories_per_100g, fc.protein_percent, fc.fat_percent,
        fc.fiber_percent, fc.ash_percent, fc.moisture_percent, fc.carbohydrate_percent,
        fc.calcium_percent, fc.phosphorus_percent, fc.sodium_percent,
        fc.target_age, fc.food_type, fc.dry_matter_content, fc.dm_protein,
        fc.dm_fat, fc.dm_fiber, fc.dm_ash, fc.calorie_density,
        fc.protein_calorie_ratio, fc.fat_calorie_ratio, fc.carbohydrate_calorie_ratio,
        fc.calcium_phosphorus_ratio, fc.favorited, fc.created_at, fc.updated_at,
        ROW_NUMBER() OVER (PARTITION BY fcc.food_calculation_id ORDER BY fcc.created_at) as rn
    FROM public.food_calculation_cats fcc
    JOIN public.food_calculations fc ON fc.id = fcc.food_calculation_id
),
additional_cats AS (
    SELECT * FROM duplicate_associations WHERE rn > 1
)
INSERT INTO public.food_calculations (
    user_id, cat_id, brand_name, product_name, food_weight,
    total_calories, calories_per_100g, protein_percent, fat_percent,
    fiber_percent, ash_percent, moisture_percent, carbohydrate_percent,
    calcium_percent, phosphorus_percent, sodium_percent,
    target_age, food_type, dry_matter_content, dm_protein,
    dm_fat, dm_fiber, dm_ash, calorie_density,
    protein_calorie_ratio, fat_calorie_ratio, carbohydrate_calorie_ratio,
    calcium_phosphorus_ratio, favorited, created_at, updated_at
)
SELECT 
    user_id, association_cat_id, brand_name, product_name, food_weight,
    total_calories, calories_per_100g, protein_percent, fat_percent,
    fiber_percent, ash_percent, moisture_percent, carbohydrate_percent,
    calcium_percent, phosphorus_percent, sodium_percent,
    target_age, food_type, dry_matter_content, dm_protein,
    dm_fat, dm_fiber, dm_ash, calorie_density,
    protein_calorie_ratio, fat_calorie_ratio, carbohydrate_calorie_ratio,
    calcium_phosphorus_ratio, favorited, created_at, updated_at
FROM additional_cats;

-- 第三步：刪除關聯表的所有政策
DROP POLICY IF EXISTS "Users can view own cat associations" ON public.food_calculation_cats;
DROP POLICY IF EXISTS "Users can insert own cat associations" ON public.food_calculation_cats;
DROP POLICY IF EXISTS "Users can update own cat associations" ON public.food_calculation_cats;
DROP POLICY IF EXISTS "Users can delete own cat associations" ON public.food_calculation_cats;

-- 第四步：刪除關聯表的索引
DROP INDEX IF EXISTS idx_food_calculation_cats_food_id;
DROP INDEX IF EXISTS idx_food_calculation_cats_cat_id;

-- 第五步：刪除關聯表
DROP TABLE IF EXISTS public.food_calculation_cats;

-- 第六步：確保 food_calculations.cat_id 有正確的外鍵約束和索引
-- 檢查是否已存在外鍵約束，如果不存在則添加
DO $$
BEGIN
    -- 檢查外鍵約束是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'food_calculations_cat_id_fkey'
        AND table_name = 'food_calculations'
    ) THEN
        -- 添加外鍵約束
        ALTER TABLE public.food_calculations 
        ADD CONSTRAINT food_calculations_cat_id_fkey 
        FOREIGN KEY (cat_id) REFERENCES public.cats(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 第七步：確保有正確的索引
CREATE INDEX IF NOT EXISTS idx_food_calculations_cat_id_new ON public.food_calculations(cat_id);

-- 第八步：更新註釋
COMMENT ON COLUMN public.food_calculations.cat_id IS '關聯的貓咪ID（直接關聯，每筆記錄只能關聯一隻貓咪）';

-- 完成訊息
DO $$
BEGIN
    RAISE NOTICE '=== 貓咪關聯簡化完成 ===';
    RAISE NOTICE '1. 已將關聯表資料遷移到 food_calculations.cat_id';
    RAISE NOTICE '2. 多貓咪關聯已轉換為多筆記錄';
    RAISE NOTICE '3. 已刪除 food_calculation_cats 關聯表';
    RAISE NOTICE '4. 系統現在使用簡化的單一貓咪關聯模式';
    RAISE NOTICE '================================';
END $$;