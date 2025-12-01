-- 添加新欄位到 food_calculations 表
-- 執行此 SQL 以更新現有的資料庫結構

-- 添加碳水化合物欄位
ALTER TABLE public.food_calculations 
ADD COLUMN IF NOT EXISTS carbohydrate_percent DECIMAL(5,2) 
CHECK (carbohydrate_percent >= 0 AND carbohydrate_percent <= 100);

-- 添加產品資訊欄位
ALTER TABLE public.food_calculations 
ADD COLUMN IF NOT EXISTS target_age VARCHAR(20);

ALTER TABLE public.food_calculations 
ADD COLUMN IF NOT EXISTS food_type VARCHAR(20);

-- 添加註釋說明新欄位的用途
COMMENT ON COLUMN public.food_calculations.carbohydrate_percent IS '碳水化合物百分比';
COMMENT ON COLUMN public.food_calculations.target_age IS '適用年齡（幼貓、成貓、老貓、全年齡）';
COMMENT ON COLUMN public.food_calculations.food_type IS '產品種類（主食罐、餐包、主食凍乾、零食凍乾、生食、乾糧）';