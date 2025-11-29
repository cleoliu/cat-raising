import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cats: {
        Row: {
          id: string
          user_id: string
          name: string
          age: number
          weight: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          age: number
          weight: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          age?: number
          weight?: number
          created_at?: string
          updated_at?: string
        }
      }
      food_calculations: {
        Row: {
          id: string
          user_id: string
          cat_id: string | null
          brand_name: string
          product_name: string
          food_weight: number
          total_calories: number | null
          calories_per_100g: number | null
          protein_percent: number
          fat_percent: number
          fiber_percent: number
          ash_percent: number
          moisture_percent: number
          calcium_percent: number | null
          phosphorus_percent: number | null
          sodium_percent: number | null
          dry_matter_content: number
          dm_protein: number
          dm_fat: number
          dm_fiber: number
          dm_ash: number
          calorie_density: number | null
          protein_calorie_ratio: number | null
          fat_calorie_ratio: number | null
          calcium_phosphorus_ratio: number | null
          notes: string | null
          favorited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cat_id?: string | null
          brand_name: string
          product_name: string
          food_weight: number
          total_calories?: number | null
          calories_per_100g?: number | null
          protein_percent: number
          fat_percent: number
          fiber_percent: number
          ash_percent: number
          moisture_percent: number
          calcium_percent?: number | null
          phosphorus_percent?: number | null
          sodium_percent?: number | null
          dry_matter_content: number
          dm_protein: number
          dm_fat: number
          dm_fiber: number
          dm_ash: number
          calorie_density?: number | null
          protein_calorie_ratio?: number | null
          fat_calorie_ratio?: number | null
          calcium_phosphorus_ratio?: number | null
          notes?: string | null
          favorited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cat_id?: string | null
          brand_name?: string
          product_name?: string
          food_weight?: number
          total_calories?: number | null
          calories_per_100g?: number | null
          protein_percent?: number
          fat_percent?: number
          fiber_percent?: number
          ash_percent?: number
          moisture_percent?: number
          calcium_percent?: number | null
          phosphorus_percent?: number | null
          sodium_percent?: number | null
          dry_matter_content?: number
          dm_protein?: number
          dm_fat?: number
          dm_fiber?: number
          dm_ash?: number
          calorie_density?: number | null
          protein_calorie_ratio?: number | null
          fat_calorie_ratio?: number | null
          calcium_phosphorus_ratio?: number | null
          notes?: string | null
          favorited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}