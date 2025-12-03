import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // Get the supplement record
    const { data: record, error } = await supabase
      .from('supplement_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Unexpected error in GET /api/supplement-records/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify the record belongs to the user
    const { data: existingRecord, error: existingError } = await supabase
      .from('supplement_records')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (existingError || !existingRecord || existingRecord.user_id !== user.id) {
      return NextResponse.json({ error: 'Record not found or unauthorized' }, { status: 404 })
    }

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

    // If cat_id is being changed, verify the new cat belongs to the user
    if (cat_id) {
      const { data: cat, error: catError } = await supabase
        .from('cats')
        .select('id')
        .eq('id', cat_id)
        .eq('user_id', user.id)
        .single()

      if (catError || !cat) {
        return NextResponse.json({ error: 'Cat not found or unauthorized' }, { status: 404 })
      }
    }

    // Validate record_type if being changed
    if (record_type && record_type !== 'supplement' && record_type !== 'medication') {
      return NextResponse.json(
        { error: 'record_type must be either "supplement" or "medication"' }, 
        { status: 400 }
      )
    }

    // Update the supplement record
    const { data, error } = await supabase
      .from('supplement_records')
      .update({
        cat_id: cat_id || undefined,
        record_time: record_time || undefined,
        record_type: record_type || undefined,
        product_name: product_name || undefined,
        product_type: product_type === null ? null : (product_type || undefined),
        dosage_amount: dosage_amount === null ? null : (dosage_amount ? parseFloat(dosage_amount) : undefined),
        dosage_unit: dosage_unit || undefined,
        frequency: frequency === null ? null : (frequency || undefined),
        treatment_duration: treatment_duration === null ? null : (treatment_duration ? parseInt(treatment_duration) : undefined),
        administration_method: administration_method === null ? null : (administration_method || undefined),
        reaction_notes: reaction_notes === null ? null : (reaction_notes || undefined),
        side_effects: side_effects === null ? null : (side_effects || undefined),
        effectiveness_rating: effectiveness_rating === null ? null : (effectiveness_rating ? parseInt(effectiveness_rating) : undefined),
        prescribed_by: prescribed_by === null ? null : (prescribed_by || undefined),
        prescription_date: prescription_date === null ? null : (prescription_date || undefined),
        notes: notes === null ? null : (notes || undefined),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      console.error('Error updating supplement record:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in PUT /api/supplement-records/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // Verify the record belongs to the user before deleting
    const { data: existingRecord, error: existingError } = await supabase
      .from('supplement_records')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (existingError) {
      console.error('Error checking existing record:', existingError)
      return NextResponse.json({ error: 'Record not found or unauthorized' }, { status: 404 })
    }

    if (!existingRecord) {
      console.error('Record not found:', id)
      return NextResponse.json({ error: 'Record not found or unauthorized' }, { status: 404 })
    }

    if (existingRecord.user_id !== user.id) {
      console.error('Unauthorized access attempt:', { recordUserId: existingRecord.user_id, currentUserId: user.id })
      return NextResponse.json({ error: 'Record not found or unauthorized' }, { status: 404 })
    }

    // Delete the supplement record
    const { error } = await supabase
      .from('supplement_records')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting supplement record:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Record deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/supplement-records/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}