-- Add micronutrients column and rename meditation to nutritional_benefits
ALTER TABLE recipes 
  ADD COLUMN IF NOT EXISTS micronutrients JSONB,
  ADD COLUMN IF NOT EXISTS nutritional_benefits TEXT;

-- Optional: Copy existing meditation data to nutritional_benefits if you want to preserve it
UPDATE recipes 
SET nutritional_benefits = meditation 
WHERE meditation IS NOT NULL AND nutritional_benefits IS NULL;
