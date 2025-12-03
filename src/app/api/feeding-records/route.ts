import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const catId = searchParams.get('cat_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client with JWT token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('feeding_records')
      .select(`
        *,
        cats (
          id,
          name,
          avatar_id
        ),
        food_calculations (
          id,
          brand_name,
          product_name
        )
      `)
      .eq('user_id', user.id)
      .order('feeding_time', { ascending: false })

    // Filter by cat if specified
    if (catId) {
      query = query.eq('cat_id', catId)
    }

    // Filter by date range if specified
    if (dateFrom) {
      query = query.gte('feeding_time', dateFrom)
    }
    if (dateTo) {
      query = query.lte('feeding_time', dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching feeding records:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const response = NextResponse.json(data || [])
    // 禁用緩存，確保總是返回最新資料
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Unexpected error in GET /api/feeding-records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client with JWT token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate required fields
    const {
      cat_id,
      feeding_time,
      food_calculation_id,
      custom_food_name,
      planned_amount,
      actual_amount,
      remaining_amount,
      amount_unit = 'grams',
      appetite_score,
      eating_speed,
      post_meal_behavior,
      notes,
      photo_url
    } = body

    if (!cat_id || !feeding_time) {
      return NextResponse.json(
        { error: 'Missing required fields: cat_id, feeding_time' }, 
        { status: 400 }
      )
    }

    // Ensure either food_calculation_id or custom_food_name is provided
    if (!food_calculation_id && !custom_food_name) {
      return NextResponse.json(
        { error: 'Either food_calculation_id or custom_food_name must be provided' }, 
        { status: 400 }
      )
    }

    // Verify the cat belongs to the user
    const { data: cat, error: catError } = await supabase
      .from('cats')
      .select('id')
      .eq('id', cat_id)
      .eq('user_id', user.id)
      .single()

    if (catError || !cat) {
      return NextResponse.json({ error: 'Cat not found or unauthorized' }, { status: 404 })
    }

    // If food_calculation_id is provided, verify it belongs to the user
    if (food_calculation_id) {
      const { data: foodCalc, error: foodError } = await supabase
        .from('food_calculations')
        .select('id')
        .eq('id', food_calculation_id)
        .eq('user_id', user.id)
        .single()

      if (foodError || !foodCalc) {
        return NextResponse.json({ error: 'Food calculation not found or unauthorized' }, { status: 404 })
      }
    }

    // Insert the feeding record
    const { data, error } = await supabase
      .from('feeding_records')
      .insert({
        user_id: user.id,
        cat_id,
        feeding_time,
        food_calculation_id: food_calculation_id || null,
        custom_food_name: custom_food_name || null,
        planned_amount: planned_amount ? parseFloat(planned_amount) : null,
        actual_amount: actual_amount ? parseFloat(actual_amount) : null,
        remaining_amount: remaining_amount ? parseFloat(remaining_amount) : null,
        amount_unit,
        appetite_score: appetite_score ? parseInt(appetite_score) : null,
        eating_speed: eating_speed || null,
        post_meal_behavior: post_meal_behavior || null,
        notes: notes || null,
        photo_url: photo_url || null
      })
      .select(`
        *,
        cats (
          id,
          name,
          avatar_id
        )
      `)
      .single()

    if (error) {
      console.error('Error creating feeding record:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in POST /api/feeding-records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}