-- 防止重複的 food_calculations 記錄
-- 請在 Supabase SQL 編輯器中執行此文件

-- 添加唯一性約束防止相同用戶在短時間內創建重複記錄
-- 基於 user_id, brand_name, product_name, food_weight 和創建時間的分鐘級別
CREATE OR REPLACE FUNCTION prevent_duplicate_calculations()
RETURNS TRIGGER AS $$
BEGIN
    -- 檢查是否在過去 30 秒內有相同的記錄
    IF EXISTS (
        SELECT 1 FROM public.food_calculations 
        WHERE user_id = NEW.user_id 
        AND brand_name = NEW.brand_name 
        AND product_name = NEW.product_name 
        AND food_weight = NEW.food_weight
        AND protein_percent = NEW.protein_percent
        AND fat_percent = NEW.fat_percent
        AND fiber_percent = NEW.fiber_percent
        AND ash_percent = NEW.ash_percent
        AND moisture_percent = NEW.moisture_percent
        AND created_at > (NOW() - INTERVAL '30 seconds')
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Duplicate calculation detected within 30 seconds';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
DROP TRIGGER IF EXISTS prevent_duplicate_calculations_trigger ON public.food_calculations;
CREATE TRIGGER prevent_duplicate_calculations_trigger
    BEFORE INSERT ON public.food_calculations
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_calculations();

-- 驗證觸發器是否正確創建
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'prevent_duplicate_calculations_trigger';