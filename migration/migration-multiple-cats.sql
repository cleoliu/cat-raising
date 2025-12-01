-- 創建產品與貓咪的多對多關係表
-- 執行此 SQL 以支持一個產品對應多隻貓咪

-- 創建關聯表
CREATE TABLE IF NOT EXISTS public.food_calculation_cats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_calculation_id UUID REFERENCES public.food_calculations(id) ON DELETE CASCADE NOT NULL,
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 確保同一個產品不會重複關聯同一隻貓咪
    UNIQUE(food_calculation_id, cat_id)
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_food_calculation_cats_food_id ON public.food_calculation_cats(food_calculation_id);
CREATE INDEX IF NOT EXISTS idx_food_calculation_cats_cat_id ON public.food_calculation_cats(cat_id);

-- 啟用RLS (Row Level Security)
ALTER TABLE public.food_calculation_cats ENABLE ROW LEVEL SECURITY;

-- 建立RLS政策 - 用戶只能訪問自己的貓咪關聯記錄
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

-- 遷移現有數據：將 food_calculations.cat_id 遷移到新的關聯表
INSERT INTO public.food_calculation_cats (food_calculation_id, cat_id)
SELECT id, cat_id 
FROM public.food_calculations 
WHERE cat_id IS NOT NULL;

-- 註釋說明
COMMENT ON TABLE public.food_calculation_cats IS '產品計算記錄與貓咪的多對多關聯表';
COMMENT ON COLUMN public.food_calculation_cats.food_calculation_id IS '關聯的產品計算記錄ID';
COMMENT ON COLUMN public.food_calculation_cats.cat_id IS '關聯的貓咪ID';