-- 修復 RLS 政策以解決關聯保存失敗的問題
-- 請在 Supabase SQL 編輯器中執行此文件

-- 1. 刪除現有的 RLS 政策
DROP POLICY IF EXISTS "Users can view own cat associations" ON public.food_calculation_cats;
DROP POLICY IF EXISTS "Users can insert own cat associations" ON public.food_calculation_cats;
DROP POLICY IF EXISTS "Users can update own cat associations" ON public.food_calculation_cats;
DROP POLICY IF EXISTS "Users can delete own cat associations" ON public.food_calculation_cats;

-- 2. 創建更寬鬆但安全的 RLS 政策
-- SELECT 政策：可以查看與自己的產品記錄關聯的貓咪
CREATE POLICY "Users can view own cat associations" ON public.food_calculation_cats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.food_calculations fc 
            WHERE fc.id = food_calculation_id 
            AND fc.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.cats c
            WHERE c.id = cat_id
            AND c.user_id = auth.uid()
        )
    );

-- INSERT 政策：可以為自己的貓咪創建關聯
CREATE POLICY "Users can insert own cat associations" ON public.food_calculation_cats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cats c
            WHERE c.id = cat_id
            AND c.user_id = auth.uid()
        )
    );

-- UPDATE 政策：可以更新自己的關聯記錄
CREATE POLICY "Users can update own cat associations" ON public.food_calculation_cats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.cats c
            WHERE c.id = cat_id
            AND c.user_id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM public.food_calculations fc 
            WHERE fc.id = food_calculation_id 
            AND fc.user_id = auth.uid()
        )
    );

-- DELETE 政策：可以刪除自己的關聯記錄  
CREATE POLICY "Users can delete own cat associations" ON public.food_calculation_cats
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.cats c
            WHERE c.id = cat_id
            AND c.user_id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM public.food_calculations fc 
            WHERE fc.id = food_calculation_id 
            AND fc.user_id = auth.uid()
        )
    );

-- 3. 驗證政策是否正確創建
SELECT 
    schemaname,
    tablename, 
    policyname, 
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'food_calculation_cats' 
AND schemaname = 'public'
ORDER BY policyname;