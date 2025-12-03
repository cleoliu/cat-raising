import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const catId = searchParams.get('cat_id')
    const type = searchParams.get('type') // 'supplement' or 'medication'
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
      .from('supplement_records')
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

    // Filter by record type if specified
    if (type && (type === 'supplement' || type === 'medication')) {
      query = query.eq('record_type', type)
    }

    // Filter by date range if specified
    if (dateFrom) {
      query = query.gte('record_time', dateFrom)
    }
    if (dateTo) {
      query = query.lte('record_time', dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching supplement records:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error in GET /api/supplement-records:', error)
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
      record_time,
      record_type,
      product_name,
      product_type,
      dosage_amount,
      dosage_unit,
      frequency,
      treatment_duration,
      administration_method,
      reaction_notes,
      side_effects,
      effectiveness_rating,
      prescribed_by,
      prescription_date,
      notes
    } = body

    if (!cat_id || !record_time || !record_type || !product_name || !dosage_unit) {
      return NextResponse.json(
        { error: 'Missing required fields: cat_id, record_time, record_type, product_name, dosage_unit' }, 
        { status: 400 }
      )
    }

    // Validate record_type
    if (record_type !== 'supplement' && record_type !== 'medication') {
      return NextResponse.json(
        { error: 'record_type must be either "supplement" or "medication"' }, 
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

    // Insert the supplement record
    const { data, error } = await supabase
      .from('supplement_records')
      .insert({
        user_id: user.id,
        cat_id,
        record_time,
        record_type,
        product_name,
        product_type: product_type || null,
        dosage_amount: parseFloat(dosage_amount),
        dosage_unit,
        frequency: frequency || null,
        treatment_duration: treatment_duration ? parseInt(treatment_duration) : null,
        administration_method: administration_method || null,
        reaction_notes: reaction_notes || null,
        side_effects: side_effects || null,
        effectiveness_rating: effectiveness_rating ? parseInt(effectiveness_rating) : null,
        prescribed_by: prescribed_by || null,
        prescription_date: prescription_date || null,
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
      console.error('Error creating supplement record:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in POST /api/supplement-records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}