-- 建立用戶表（擴展預設的auth.users）
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立貓咪表
CREATE TABLE IF NOT EXISTS public.cats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 30),
    birthday DATE,
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
    avatar_id VARCHAR(20) DEFAULT 'cat-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立計算記錄表
CREATE TABLE IF NOT EXISTS public.food_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    cat_id UUID REFERENCES public.cats(id) ON DELETE SET NULL,
    
    -- 基本資訊
    brand_name VARCHAR(200) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    
    -- 重量與熱量
    food_weight DECIMAL(8,2) NOT NULL CHECK (food_weight > 0),
    total_calories DECIMAL(8,2) CHECK (total_calories >= 0),
    calories_per_100g DECIMAL(8,2) CHECK (calories_per_100g >= 0),
    
    -- 主要營養成分
    protein_percent DECIMAL(5,2) NOT NULL CHECK (protein_percent >= 0 AND protein_percent <= 100),
    fat_percent DECIMAL(5,2) NOT NULL CHECK (fat_percent >= 0 AND fat_percent <= 100),
    fiber_percent DECIMAL(5,2) NOT NULL CHECK (fiber_percent >= 0 AND fiber_percent <= 100),
    ash_percent DECIMAL(5,2) NOT NULL CHECK (ash_percent >= 0 AND ash_percent <= 100),
    moisture_percent DECIMAL(5,2) NOT NULL CHECK (moisture_percent >= 0 AND moisture_percent <= 100),
    carbohydrate_percent DECIMAL(5,2) CHECK (carbohydrate_percent >= 0 AND carbohydrate_percent <= 100),
    
    -- 礦物質成分
    calcium_percent DECIMAL(5,2) CHECK (calcium_percent >= 0 AND calcium_percent <= 100),
    phosphorus_percent DECIMAL(5,2) CHECK (phosphorus_percent >= 0 AND phosphorus_percent <= 100),
    sodium_percent DECIMAL(5,2) CHECK (sodium_percent >= 0 AND sodium_percent <= 100),
    
    -- 計算結果
    dry_matter_content DECIMAL(5,2) NOT NULL,
    dm_protein DECIMAL(5,2) NOT NULL,
    dm_fat DECIMAL(5,2) NOT NULL,
    dm_fiber DECIMAL(5,2) NOT NULL,
    dm_ash DECIMAL(5,2) NOT NULL,
    calorie_density DECIMAL(8,2),
    protein_calorie_ratio DECIMAL(5,2),
    fat_calorie_ratio DECIMAL(5,2),
    calcium_phosphorus_ratio DECIMAL(5,2),
    
    -- 產品資訊
    target_age VARCHAR(20),
    food_type VARCHAR(20),
    
    -- 額外資訊
    notes TEXT,
    favorited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 約束條件：營養成分總和不超過100%
    CONSTRAINT check_nutrition_sum CHECK (
        protein_percent + fat_percent + fiber_percent + ash_percent + moisture_percent <= 100
    )
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_cats_user_id ON public.cats(user_id);
CREATE INDEX IF NOT EXISTS idx_food_calculations_user_id ON public.food_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_food_calculations_cat_id ON public.food_calculations(cat_id);
CREATE INDEX IF NOT EXISTS idx_food_calculations_created_at ON public.food_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_calculations_brand_name ON public.food_calculations(brand_name);

-- 建立更新時間的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為每個表建立更新時間觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cats_updated_at BEFORE UPDATE ON public.cats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_calculations_updated_at BEFORE UPDATE ON public.food_calculations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 建立用戶註冊時自動建立用戶記錄的函數
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 建立用戶註冊觸發器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 啟用RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_calculations ENABLE ROW LEVEL SECURITY;

-- 建立RLS政策
-- 用戶只能訪問自己的資料
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 貓咪資料政策
CREATE POLICY "Users can view own cats" ON public.cats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cats" ON public.cats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cats" ON public.cats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cats" ON public.cats
    FOR DELETE USING (auth.uid() = user_id);

-- 計算記錄政策
CREATE POLICY "Users can view own calculations" ON public.food_calculations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" ON public.food_calculations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations" ON public.food_calculations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations" ON public.food_calculations
    FOR DELETE USING (auth.uid() = user_id);