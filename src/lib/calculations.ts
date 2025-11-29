import { FoodCalculationInput, CalculationResult } from '@/types'

export function calculateNutrition(input: FoodCalculationInput): CalculationResult {
  // 基礎計算：乾物質含量
  const dryMatterContent = 100 - input.moisture_percent

  // 乾物質基準營養成分
  const dmProtein = (input.protein_percent / dryMatterContent) * 100
  const dmFat = (input.fat_percent / dryMatterContent) * 100
  const dmFiber = (input.fiber_percent / dryMatterContent) * 100
  const dmAsh = (input.ash_percent / dryMatterContent) * 100

  const result: CalculationResult = {
    dry_matter_content: Number(dryMatterContent.toFixed(2)),
    dm_protein: Number(dmProtein.toFixed(2)),
    dm_fat: Number(dmFat.toFixed(2)),
    dm_fiber: Number(dmFiber.toFixed(2)),
    dm_ash: Number(dmAsh.toFixed(2)),
  }

  // 熱量計算（當提供時）
  if (input.total_calories && input.food_weight) {
    const caloreDensity = (input.total_calories / input.food_weight) * 100
    result.calorie_density = Number(caloreDensity.toFixed(2))
  }

  if (input.calories_per_100g) {
    // 蛋白質熱量比 = (乾物質基準蛋白質% × 4 kcal/g) / 單位熱量 × 100%
    const proteinCalorieRatio = (dmProtein * 4) / input.calories_per_100g * 100
    result.protein_calorie_ratio = Number(proteinCalorieRatio.toFixed(2))

    // 脂肪熱量比 = (乾物質基準脂肪% × 9 kcal/g) / 單位熱量 × 100%
    const fatCalorieRatio = (dmFat * 9) / input.calories_per_100g * 100
    result.fat_calorie_ratio = Number(fatCalorieRatio.toFixed(2))
  }

  // 礦物質比率（當提供時）
  if (input.calcium_percent && input.phosphorus_percent && input.phosphorus_percent > 0) {
    const calciumPhosphorusRatio = input.calcium_percent / input.phosphorus_percent
    result.calcium_phosphorus_ratio = Number(calciumPhosphorusRatio.toFixed(2))
  }

  return result
}

export function validateNutritionInput(input: Partial<FoodCalculationInput>): string[] {
  const errors: string[] = []

  // 必填欄位檢查
  if (!input.brand_name?.trim()) {
    errors.push('品牌名稱為必填')
  }
  
  if (!input.product_name?.trim()) {
    errors.push('產品名稱為必填')
  }

  if (!input.food_weight || input.food_weight <= 0) {
    errors.push('食物重量必須大於0')
  }

  if (typeof input.protein_percent !== 'number' || input.protein_percent < 0 || input.protein_percent > 100) {
    errors.push('蛋白質含量必須在0-100%之間')
  }

  if (typeof input.fat_percent !== 'number' || input.fat_percent < 0 || input.fat_percent > 100) {
    errors.push('脂肪含量必須在0-100%之間')
  }

  if (typeof input.fiber_percent !== 'number' || input.fiber_percent < 0 || input.fiber_percent > 100) {
    errors.push('纖維含量必須在0-100%之間')
  }

  if (typeof input.ash_percent !== 'number' || input.ash_percent < 0 || input.ash_percent > 100) {
    errors.push('灰分含量必須在0-100%之間')
  }

  if (typeof input.moisture_percent !== 'number' || input.moisture_percent < 0 || input.moisture_percent > 100) {
    errors.push('水分含量必須在0-100%之間')
  }

  // 百分比總和檢查
  const totalPercent = (input.protein_percent || 0) + 
                      (input.fat_percent || 0) + 
                      (input.fiber_percent || 0) + 
                      (input.ash_percent || 0) + 
                      (input.moisture_percent || 0)

  if (totalPercent > 100) {
    errors.push('所有營養成分百分比總和不可超過100%')
  }

  return errors
}