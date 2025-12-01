-- 添加熱量相關欄位到 food_calculations 表
-- 執行此 SQL 以更新現有的資料庫結構

-- 添加碳水化合物熱量比欄位
ALTER TABLE public.food_calculations 
ADD COLUMN IF NOT EXISTS carbohydrate_calorie_ratio DECIMAL(5,2);

-- 添加註釋說明新欄位的用途
COMMENT ON COLUMN public.food_calculations.carbohydrate_calorie_ratio IS '碳水化合物熱量比 (%)';