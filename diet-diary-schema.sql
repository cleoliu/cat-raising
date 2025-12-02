-- 飲食日記系統 - 資料庫 Schema
-- 根據 PRD 文檔實現的完整資料庫結構

-- 1. 餵食記錄主表
CREATE TABLE IF NOT EXISTS public.feeding_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE NOT NULL,
    feeding_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- 食物相關
    food_calculation_id UUID REFERENCES public.food_calculations(id) ON DELETE SET NULL,
    custom_food_name VARCHAR(100),
    
    -- 份量管理
    planned_amount DECIMAL(8,2) NOT NULL CHECK (planned_amount > 0),
    actual_amount DECIMAL(8,2) CHECK (actual_amount >= 0),
    remaining_amount DECIMAL(8,2) CHECK (remaining_amount >= 0),
    amount_unit VARCHAR(20) DEFAULT 'grams' CHECK (amount_unit IN ('grams', 'pieces', 'portion', 'ml')),
    
    -- 貓咪反應評估
    appetite_score INTEGER CHECK (appetite_score >= 1 AND appetite_score <= 5),
    eating_speed VARCHAR(20) CHECK (eating_speed IN ('slow', 'normal', 'fast', 'gulping')),
    post_meal_behavior VARCHAR(50),
    
    -- 額外資訊
    notes TEXT,
    photo_url VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 約束：實際攝取量不能超過計劃份量
    CONSTRAINT check_amounts CHECK (actual_amount <= planned_amount),
    CONSTRAINT check_food_reference CHECK (
        (food_calculation_id IS NOT NULL AND custom_food_name IS NULL) OR
        (food_calculation_id IS NULL AND custom_food_name IS NOT NULL)
    )
);

-- 2. 飲水記錄表
CREATE TABLE IF NOT EXISTS public.water_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE NOT NULL,
    record_date DATE NOT NULL,
    record_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 飲水量追蹤
    water_amount DECIMAL(6,2) NOT NULL CHECK (water_amount > 0),
    
    -- 水質管理
    water_type VARCHAR(30) DEFAULT 'tap_water' CHECK (water_type IN 
        ('tap_water', 'boiled_water', 'filtered_water', 'mineral_water', 'distilled_water', 'other')),
    water_source VARCHAR(50), -- 飲水地點或來源描述
    
    -- 額外資訊
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 保健品與藥物記錄表
CREATE TABLE IF NOT EXISTS public.supplement_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE NOT NULL,
    record_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- 記錄類型
    record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('supplement', 'medication')),
    
    -- 產品資訊
    product_name VARCHAR(200) NOT NULL,
    product_type VARCHAR(50), -- '魚油', '益生菌', '維他命', '抗生素' 等
    
    -- 劑量資訊
    dosage_amount DECIMAL(8,2) NOT NULL CHECK (dosage_amount > 0),
    dosage_unit VARCHAR(20) NOT NULL CHECK (dosage_unit IN ('ml', 'mg', 'g', 'capsule', 'tablet', 'drops')),
    
    -- 用藥管理
    frequency VARCHAR(30) CHECK (frequency IN ('once_daily', 'twice_daily', 'three_times_daily', 'as_needed')),
    treatment_duration INTEGER, -- 療程天數
    administration_method VARCHAR(30) CHECK (administration_method IN ('oral', 'topical', 'injection', 'eye_drops', 'ear_drops')),
    
    -- 效果與反應
    reaction_notes TEXT,
    side_effects TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    
    -- 處方資訊
    prescribed_by VARCHAR(100), -- 獸醫師名稱
    prescription_date DATE,
    
    -- 額外資訊
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 每日營養攝取統計表
CREATE TABLE IF NOT EXISTS public.daily_nutrition_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE NOT NULL,
    summary_date DATE NOT NULL,
    
    -- 營養統計
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_fat DECIMAL(8,2) DEFAULT 0,
    total_carbohydrate DECIMAL(8,2) DEFAULT 0,
    total_fiber DECIMAL(8,2) DEFAULT 0,
    
    -- 餵食統計
    feeding_count INTEGER DEFAULT 0,
    average_appetite_score DECIMAL(3,2),
    
    -- 飲水統計
    water_intake DECIMAL(6,2) DEFAULT 0,
    
    -- 保健品統計
    supplement_count INTEGER DEFAULT 0,
    medication_count INTEGER DEFAULT 0,
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一約束：每個貓咪每天只能有一筆統計記錄
    UNIQUE(cat_id, summary_date)
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_feeding_records_user_cat_time ON public.feeding_records(user_id, cat_id, feeding_time DESC);

CREATE INDEX IF NOT EXISTS idx_water_records_user_cat_date ON public.water_records(user_id, cat_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_supplement_records_user_cat_time ON public.supplement_records(user_id, cat_id, record_time DESC);
CREATE INDEX IF NOT EXISTS idx_supplement_records_type ON public.supplement_records(record_type);

CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_cat_date ON public.daily_nutrition_summary(user_id, cat_id, summary_date DESC);

-- 建立更新時間的觸發器
CREATE TRIGGER update_feeding_records_updated_at BEFORE UPDATE ON public.feeding_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_water_records_updated_at BEFORE UPDATE ON public.water_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplement_records_updated_at BEFORE UPDATE ON public.supplement_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 啟用 RLS (Row Level Security)
ALTER TABLE public.feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_nutrition_summary ENABLE ROW LEVEL SECURITY;

-- RLS 政策：用戶只能訪問自己的資料

-- 餵食記錄政策
CREATE POLICY "Users can view own feeding records" ON public.feeding_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feeding records" ON public.feeding_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feeding records" ON public.feeding_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feeding records" ON public.feeding_records
    FOR DELETE USING (auth.uid() = user_id);

-- 飲水記錄政策
CREATE POLICY "Users can view own water records" ON public.water_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water records" ON public.water_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water records" ON public.water_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own water records" ON public.water_records
    FOR DELETE USING (auth.uid() = user_id);

-- 保健品與藥物記錄政策
CREATE POLICY "Users can view own supplement records" ON public.supplement_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplement records" ON public.supplement_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplement records" ON public.supplement_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplement records" ON public.supplement_records
    FOR DELETE USING (auth.uid() = user_id);

-- 營養統計政策
CREATE POLICY "Users can view own nutrition summary" ON public.daily_nutrition_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition summary" ON public.daily_nutrition_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition summary" ON public.daily_nutrition_summary
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition summary" ON public.daily_nutrition_summary
    FOR DELETE USING (auth.uid() = user_id);