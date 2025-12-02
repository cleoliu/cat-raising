import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const catId = searchParams.get('cat_id')
    const date = searchParams.get('date')

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!catId || !date) {
      return NextResponse.json({ error: 'cat_id and date are required' }, { status: 400 })
    }

    // Calculate nutrition summary for the given cat and date
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`

    // Get all feeding records for the day
    const { data: feedingRecords, error: feedingError } = await supabase
      .from('feeding_records')
      .select(`
        *,
        food_calculations (
          calories_per_100g,
          protein_percent,
          fat_percent,
          carbohydrate_percent,
          fiber_percent
        )
      `)
      .eq('user_id', user.id)
      .eq('cat_id', catId)
      .gte('feeding_time', startOfDay)
      .lte('feeding_time', endOfDay)

    if (feedingError) {
      console.error('Error fetching feeding records:', feedingError)
      return NextResponse.json({ error: feedingError.message }, { status: 500 })
    }

    // Get water records for the day
    const { data: waterRecords, error: waterError } = await supabase
      .from('water_records')
      .select('water_amount')
      .eq('user_id', user.id)
      .eq('cat_id', catId)
      .eq('record_date', date)

    if (waterError) {
      console.error('Error fetching water records:', waterError)
      return NextResponse.json({ error: waterError.message }, { status: 500 })
    }

    // Get supplement/medication records for the day
    const { data: supplementRecords, error: supplementError } = await supabase
      .from('supplement_records')
      .select('record_type')
      .eq('user_id', user.id)
      .eq('cat_id', catId)
      .gte('record_time', startOfDay)
      .lte('record_time', endOfDay)

    if (supplementError) {
      console.error('Error fetching supplement records:', supplementError)
      return NextResponse.json({ error: supplementError.message }, { status: 500 })
    }

    // Calculate nutrition totals
    let totalCalories = 0
    let totalProtein = 0
    let totalFat = 0
    let totalCarbohydrate = 0
    let totalFiber = 0
    let feedingCount = 0
    let totalAppetiteScore = 0
    let appetiteRecords = 0

    feedingRecords?.forEach(record => {
      feedingCount++
      
      const actualAmount = record.actual_amount || record.planned_amount
      
      if (record.food_calculations) {
        const calc = record.food_calculations
        
        // Calculate calories
        if (calc.calories_per_100g) {
          totalCalories += (calc.calories_per_100g / 100) * actualAmount
        }
        
        // Calculate protein in grams
        if (calc.protein_percent) {
          totalProtein += (calc.protein_percent / 100) * actualAmount
        }
        
        // Calculate fat in grams
        if (calc.fat_percent) {
          totalFat += (calc.fat_percent / 100) * actualAmount
        }
        
        // Calculate carbohydrate in grams
        if (calc.carbohydrate_percent) {
          totalCarbohydrate += (calc.carbohydrate_percent / 100) * actualAmount
        }
        
        // Calculate fiber in grams
        if (calc.fiber_percent) {
          totalFiber += (calc.fiber_percent / 100) * actualAmount
        }
      }
      
      // Track appetite scores
      if (record.appetite_score) {
        totalAppetiteScore += record.appetite_score
        appetiteRecords++
      }
    })

    // Calculate water intake
    let waterIntake = 0
    waterRecords?.forEach(record => {
      waterIntake += record.water_amount
    })

    // Count supplements and medications
    let supplementCount = 0
    let medicationCount = 0
    supplementRecords?.forEach(record => {
      if (record.record_type === 'supplement') {
        supplementCount++
      } else if (record.record_type === 'medication') {
        medicationCount++
      }
    })

    const nutritionSummary = {
      summary_date: date,
      cat_id: catId,
      total_calories: Math.round(totalCalories * 100) / 100,
      total_protein: Math.round(totalProtein * 100) / 100,
      total_fat: Math.round(totalFat * 100) / 100,
      total_carbohydrate: Math.round(totalCarbohydrate * 100) / 100,
      total_fiber: Math.round(totalFiber * 100) / 100,
      feeding_count: feedingCount,
      average_appetite_score: appetiteRecords > 0 ? Math.round((totalAppetiteScore / appetiteRecords) * 100) / 100 : null,
      water_intake: waterIntake,
      supplement_count: supplementCount,
      medication_count: medicationCount,
      calculated_at: new Date().toISOString()
    }

    // Check if summary already exists for this date
    const { data: existingSummary } = await supabase
      .from('daily_nutrition_summary')
      .select('id')
      .eq('user_id', user.id)
      .eq('cat_id', catId)
      .eq('summary_date', date)
      .single()

    if (existingSummary) {
      // Update existing summary
      const { data: updatedSummary, error: updateError } = await supabase
        .from('daily_nutrition_summary')
        .update(nutritionSummary)
        .eq('id', existingSummary.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating nutrition summary:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json(updatedSummary)
    } else {
      // Create new summary
      const { data: newSummary, error: insertError } = await supabase
        .from('daily_nutrition_summary')
        .insert({
          ...nutritionSummary,
          user_id: user.id
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating nutrition summary:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json(newSummary)
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/nutrition-summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}