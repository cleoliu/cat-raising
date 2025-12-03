-- 修正飲食記錄中的選填欄位，讓它們可以為 NULL
-- 這個 migration 修正資料庫 schema 以符合前端表單的選填欄位設計

-- 1. 修正餵食記錄表的 planned_amount 欄位
ALTER TABLE public.feeding_records 
DROP CONSTRAINT IF EXISTS feeding_records_planned_amount_check,
ALTER COLUMN planned_amount DROP NOT NULL,
ADD CONSTRAINT feeding_records_planned_amount_check CHECK (planned_amount IS NULL OR planned_amount > 0);

-- 2. 修正飲水記錄表的 water_amount 欄位  
ALTER TABLE public.water_records
DROP CONSTRAINT IF EXISTS water_records_water_amount_check,
ALTER COLUMN water_amount DROP NOT NULL,
ADD CONSTRAINT water_records_water_amount_check CHECK (water_amount IS NULL OR water_amount > 0);

-- 3. 修正保健品記錄表的 dosage_amount 欄位
ALTER TABLE public.supplement_records
DROP CONSTRAINT IF EXISTS supplement_records_dosage_amount_check,
ALTER COLUMN dosage_amount DROP NOT NULL,
ADD CONSTRAINT supplement_records_dosage_amount_check CHECK (dosage_amount IS NULL OR dosage_amount > 0);

-- 4. 修正餵食記錄表的約束邏輯，當 planned_amount 為 null 時不檢查
ALTER TABLE public.feeding_records 
DROP CONSTRAINT IF EXISTS check_amounts,
ADD CONSTRAINT check_amounts CHECK (
    planned_amount IS NULL OR 
    actual_amount IS NULL OR 
    actual_amount <= planned_amount
);