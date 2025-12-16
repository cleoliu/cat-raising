-- Migration: 統一 water_records 時間處理邏輯
-- 目的: 解決 water_records 日期篩選的時區問題，統一使用 record_time 進行查詢
-- 日期: 2024-12-16
-- 說明: 原本 water_records 使用 record_date 和 record_time 兩個欄位，
--       導致時區處理不一致。此 migration 統一使用 record_time。

-- 1. 備份現有資料 (可選，建議在生產環境執行前先做)
-- CREATE TABLE water_records_backup AS SELECT * FROM water_records;

-- 2. 更新現有記錄：確保所有記錄都有正確的 record_time
-- 如果 record_time 是預設值 (等於 created_at) 或為空，則從 record_date 重建
UPDATE water_records 
SET record_time = CASE 
    -- 如果 record_time 等於 created_at (代表是預設值)，使用 record_date 重建
    WHEN record_time = created_at OR record_time IS NULL THEN 
        (record_date || ' 12:00:00+08:00')::timestamptz
    -- 否則保持原值
    ELSE record_time 
END
WHERE record_time = created_at OR record_time IS NULL;

-- 3. 確保 record_time 不為空 (現在統一使用這個欄位)
UPDATE water_records 
SET record_time = COALESCE(record_time, created_at)
WHERE record_time IS NULL;

-- 4. 更新索引：移除舊的 record_date 索引，新增 record_time 索引
DROP INDEX IF EXISTS idx_water_records_user_cat_date;
CREATE INDEX IF NOT EXISTS idx_water_records_user_cat_time ON water_records(user_id, cat_id, record_time DESC);

-- 5. 讓 record_date 變成可選（保留欄位以免破壞現有資料，但不再強制要求）
ALTER TABLE water_records ALTER COLUMN record_date DROP NOT NULL;

-- 6. 新增註解說明欄位用途
COMMENT ON COLUMN water_records.record_time IS '飲水記錄的實際時間 (主要用於查詢和排序)';
COMMENT ON COLUMN water_records.record_date IS '飲水記錄的日期 (舊版相容欄位，新記錄可為空)';

-- 7. 驗證資料完整性
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count FROM water_records WHERE record_time IS NULL;
    
    IF null_count > 0 THEN
        RAISE EXCEPTION 'Migration 失敗: 仍有 % 筆記錄的 record_time 為空', null_count;
    END IF;
    
    RAISE NOTICE 'Migration 成功完成: 所有 water_records 都有有效的 record_time';
END $$;

-- 8. 輸出統計資訊
SELECT 
    '統計資訊' as info,
    COUNT(*) as total_records,
    COUNT(CASE WHEN record_date IS NOT NULL THEN 1 END) as records_with_date,
    COUNT(CASE WHEN record_time IS NOT NULL THEN 1 END) as records_with_time,
    MIN(record_time) as earliest_record,
    MAX(record_time) as latest_record
FROM water_records;