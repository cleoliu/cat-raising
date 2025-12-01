-- 為 cats 表添加 avatar_id 和 birthday 欄位
-- 執行此遷移來更新現有資料庫

-- 添加 avatar_id 欄位
ALTER TABLE public.cats 
ADD COLUMN IF NOT EXISTS avatar_id VARCHAR(20) DEFAULT 'cat-1';

-- 添加 birthday 欄位
ALTER TABLE public.cats 
ADD COLUMN IF NOT EXISTS birthday DATE;

-- 建立索引（可選）
CREATE INDEX IF NOT EXISTS idx_cats_avatar_id ON public.cats(avatar_id);

-- 更新現有記錄的預設頭像（如果需要）
UPDATE public.cats 
SET avatar_id = 'cat-1' 
WHERE avatar_id IS NULL;

-- 顯示更新結果
SELECT 'Migration completed successfully. Added avatar_id and birthday columns to cats table.' as message;