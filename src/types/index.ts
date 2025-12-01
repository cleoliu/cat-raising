export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Cat {
  id: string
  user_id: string
  name: string
  age: number
  birthday?: string
  weight: number
  avatar_id?: string
  created_at: string
  updated_at: string
}

export interface FoodCalculationInput {
  brand_name: string
  product_name: string
  food_weight: number
  total_calories?: number
  calories_per_100g?: number
  protein_percent: number
  fat_percent: number
  fiber_percent: number
  ash_percent: number
  moisture_percent: number
  carbohydrate_percent?: number
  calcium_percent?: number
  phosphorus_percent?: number
  sodium_percent?: number
  target_age?: string
  food_type?: string
}

export interface FoodCalculation {
  id: string
  user_id: string
  cat_id: string | null
  brand_name: string
  product_name: string
  food_weight: number
  total_calories: number | null
  calories_per_100g: number | null
  calories: number | null
  protein_percent: number
  fat_percent: number
  fiber_percent: number
  ash_percent: number
  moisture_percent: number
  carbohydrate_percent: number | null
  calcium_percent: number | null
  phosphorus_percent: number | null
  sodium_percent: number | null
  target_age: string | null
  food_type: string | null
  dry_matter_content: number
  dm_protein: number
  dm_fat: number
  dm_fiber: number
  dm_ash: number
  calorie_density: number | null
  protein_calorie_ratio: number | null
  fat_calorie_ratio: number | null
  carbohydrate_calorie_ratio: number | null
  calcium_phosphorus_ratio: number | null
  notes: string | null
  favorited: boolean
  created_at: string
  updated_at: string
}

export interface CalculationResult {
  dry_matter_content: number
  dm_protein: number
  dm_fat: number
  dm_fiber: number
  dm_ash: number
  calorie_density?: number
  protein_calorie_ratio?: number
  fat_calorie_ratio?: number
  carbohydrate_calorie_ratio?: number
  calcium_phosphorus_ratio?: number
}

export interface FoodCalculationCat {
  id: string
  food_calculation_id: string
  cat_id: string
  created_at: string
}