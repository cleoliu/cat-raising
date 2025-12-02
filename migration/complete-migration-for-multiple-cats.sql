-- 完整的多貓關聯功能遷移
-- 請在 Supabase SQL 編輯器中執行此文件

-- 1. 首先檢查並添加缺失的欄位
ALTER TABLE public.food_calculations 
ADD COLUMN IF NOT EXISTS carbohydrate_calorie_ratio DECIMAL(5,2);

-- 2. 創建食品與貓咪的多對多關係表
CREATE TABLE IF NOT EXISTS public.food_calculation_cats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_calculation_id UUID REFERENCES public.food_calculations(id) ON DELETE CASCADE NOT NULL,
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 確保同一個食品不會重複關聯同一隻貓咪
    UNIQUE(food_calculation_id, cat_id)
);

-- 3. 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_food_calculation_cats_food_id ON public.food_calculation_cats(food_calculation_id);
CREATE INDEX IF NOT EXISTS idx_food_calculation_cats_cat_id ON public.food_calculation_cats(cat_id);

-- 4. 啟用RLS (Row Level Security)
ALTER TABLE public.food_calculation_cats ENABLE ROW LEVEL SECURITY;

-- 5. 建立RLS政策 - 用戶只能訪問自己的貓咪關聯記錄
DO $$ BEGIN
    -- 刪除可能存在的舊政策
    DROP POLICY IF EXISTS "Users can view own cat associations" ON public.food_calculation_cats;
    DROP POLICY IF EXISTS "Users can insert own cat associations" ON public.food_calculation_cats;
    DROP POLICY IF EXISTS "Users can update own cat associations" ON public.food_calculation_cats;
    DROP POLICY IF EXISTS "Users can delete own cat associations" ON public.food_calculation_cats;
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

-- 建立新的RLS政策
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

-- 6. 遷移現有數據：將 food_calculations.cat_id 遷移到新的關聯表
INSERT INTO public.food_calculation_cats (food_calculation_id, cat_id)
SELECT id, cat_id 
FROM public.food_calculations 
WHERE cat_id IS NOT NULL
ON CONFLICT (food_calculation_id, cat_id) DO NOTHING;

-- 7. 添加註釋說明
COMMENT ON TABLE public.food_calculation_cats IS '食品計算記錄與貓咪的多對多關聯表';
COMMENT ON COLUMN public.food_calculation_cats.food_calculation_id IS '關聯的食品計算記錄ID';
COMMENT ON COLUMN public.food_calculation_cats.cat_id IS '關聯的貓咪ID';
COMMENT ON COLUMN public.food_calculations.carbohydrate_calorie_ratio IS '碳水化合物熱量比 (%)';

-- 8. 驗證遷移結果
DO $$
DECLARE 
    table_count INTEGER;
    association_count INTEGER;
BEGIN
    -- 檢查表是否創建成功
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'food_calculation_cats';
    
    IF table_count = 0 THEN
        RAISE EXCEPTION 'Migration failed: food_calculation_cats table was not created';
    END IF;
    
    -- 檢查關聯記錄數量
    SELECT COUNT(*) INTO association_count FROM public.food_calculation_cats;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'food_calculation_cats table created: %', (table_count = 1);
    RAISE NOTICE 'Migrated % existing associations', association_count;
END $$;