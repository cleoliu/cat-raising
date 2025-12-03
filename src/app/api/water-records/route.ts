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
      .from('water_records')
      .select(`
        *,
        cats (
          id,
          name,
          avatar_id
        )
      `)
      .eq('user_id', user.id)
      .order('record_time', { ascending: false })

    // Filter by cat if specified
    if (catId) {
      query = query.eq('cat_id', catId)
    }

    // Filter by date range if specified
    if (dateFrom) {
      query = query.gte('record_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('record_date', dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching water records:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error in GET /api/water-records:', error)
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
      record_date,
      record_time = new Date().toISOString(),
      water_amount,
      water_type = 'tap_water',
      water_source,
      notes
    } = body

    if (!cat_id || !record_date) {
      return NextResponse.json(
        { error: 'Missing required fields: cat_id, record_date' }, 
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

    // Insert the water record
    const { data, error } = await supabase
      .from('water_records')
      .insert({
        user_id: user.id,
        cat_id,
        record_date,
        record_time,
        water_amount: water_amount ? parseFloat(water_amount) : null,
        water_type,
        water_source: water_source || null,
        notes: notes || null
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
      console.error('Error creating water record:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in POST /api/water-records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}