import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const catId = searchParams.get('cat_id')
    const period = searchParams.get('period') // 'week' or 'month'
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!catId) {
      return NextResponse.json({ error: 'cat_id is required' }, { status: 400 })
    }

    // Calculate date range based on period
    let startDate: string
    let endDate: string

    if (dateFrom && dateTo) {
      startDate = dateFrom
      endDate = dateTo
    } else if (period === 'week') {
      // Last 7 days
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 6) // 6 days ago + today = 7 days
      startDate = start.toISOString().split('T')[0]
      endDate = end.toISOString().split('T')[0]
    } else if (period === 'month') {
      // Last 30 days
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 29) // 29 days ago + today = 30 days
      startDate = start.toISOString().split('T')[0]
      endDate = end.toISOString().split('T')[0]
    } else {
      return NextResponse.json({ error: 'Invalid period. Must be "week" or "month", or provide date_from and date_to' }, { status: 400 })
    }

    // Get existing nutrition summaries in the date range
    const { data: summaries, error: summariesError } = await supabase
      .from('daily_nutrition_summary')
      .select('*')
      .eq('user_id', user.id)
      .eq('cat_id', catId)
      .gte('summary_date', startDate)
      .lte('summary_date', endDate)
      .order('summary_date', { ascending: true })

    if (summariesError) {
      console.error('Error fetching nutrition summaries:', summariesError)
      return NextResponse.json({ error: summariesError.message }, { status: 500 })
    }

    // Generate date range array
    const dateRange: string[] = []
    const currentDate = new Date(startDate)
    const end = new Date(endDate)

    while (currentDate <= end) {
      dateRange.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Fill in missing dates with zero values and organize data
    const trendData = dateRange.map(date => {
      const summary = summaries?.find(s => s.summary_date === date)
      
      return {
        date,
        total_calories: summary?.total_calories || 0,
        total_protein: summary?.total_protein || 0,
        total_fat: summary?.total_fat || 0,
        total_carbohydrate: summary?.total_carbohydrate || 0,
        total_fiber: summary?.total_fiber || 0,
        feeding_count: summary?.feeding_count || 0,
        average_appetite_score: summary?.average_appetite_score || null,
        water_intake: summary?.water_intake || 0,
        supplement_count: summary?.supplement_count || 0,
        medication_count: summary?.medication_count || 0
      }
    })

    // Calculate period averages
    const validDays = trendData.filter(day => day.feeding_count > 0)
    const totalDays = validDays.length

    const averages = {
      avg_calories: totalDays > 0 ? Math.round((validDays.reduce((sum, day) => sum + day.total_calories, 0) / totalDays) * 100) / 100 : 0,
      avg_protein: totalDays > 0 ? Math.round((validDays.reduce((sum, day) => sum + day.total_protein, 0) / totalDays) * 100) / 100 : 0,
      avg_fat: totalDays > 0 ? Math.round((validDays.reduce((sum, day) => sum + day.total_fat, 0) / totalDays) * 100) / 100 : 0,
      avg_carbohydrate: totalDays > 0 ? Math.round((validDays.reduce((sum, day) => sum + day.total_carbohydrate, 0) / totalDays) * 100) / 100 : 0,
      avg_fiber: totalDays > 0 ? Math.round((validDays.reduce((sum, day) => sum + day.total_fiber, 0) / totalDays) * 100) / 100 : 0,
      avg_feeding_count: totalDays > 0 ? Math.round((validDays.reduce((sum, day) => sum + day.feeding_count, 0) / totalDays) * 100) / 100 : 0,
      avg_water_intake: totalDays > 0 ? Math.round((validDays.reduce((sum, day) => sum + day.water_intake, 0) / totalDays) * 100) / 100 : 0,
      total_supplement_count: trendData.reduce((sum, day) => sum + day.supplement_count, 0),
      total_medication_count: trendData.reduce((sum, day) => sum + day.medication_count, 0)
    }

    // Calculate appetite score average (only for days with appetite data)
    const appetiteDays = validDays.filter(day => day.average_appetite_score !== null)
    const avgAppetiteScore = appetiteDays.length > 0 
      ? Math.round((appetiteDays.reduce((sum, day) => sum + (day.average_appetite_score || 0), 0) / appetiteDays.length) * 100) / 100 
      : null

    return NextResponse.json({
      period,
      date_from: startDate,
      date_to: endDate,
      cat_id: catId,
      daily_data: trendData,
      averages: {
        ...averages,
        avg_appetite_score: avgAppetiteScore
      },
      summary: {
        total_days: dateRange.length,
        days_with_data: totalDays,
        days_with_appetite_data: appetiteDays.length
      }
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/nutrition-trends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}