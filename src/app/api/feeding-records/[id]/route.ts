import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the record belongs to the user
    const { data: existingRecord, error: existingError } = await supabase
      .from('feeding_records')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (existingError || !existingRecord || existingRecord.user_id !== user.id) {
      return NextResponse.json({ error: 'Record not found or unauthorized' }, { status: 404 })
    }

    const {
      cat_id,
      feeding_time,
      food_calculation_id,
      custom_food_name,
      planned_amount,
      actual_amount,
      remaining_amount,
      amount_unit,
      appetite_score,
      eating_speed,
      post_meal_behavior,
      notes,
      photo_url
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

    // If food_calculation_id is being changed, verify it belongs to the user
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

    // Update the feeding record
    const { data, error } = await supabase
      .from('feeding_records')
      .update({
        cat_id: cat_id || undefined,
        feeding_time: feeding_time || undefined,
        food_calculation_id: food_calculation_id === null ? null : (food_calculation_id || undefined),
        custom_food_name: custom_food_name === null ? null : (custom_food_name || undefined),
        planned_amount: planned_amount ? parseFloat(planned_amount) : undefined,
        actual_amount: actual_amount === null ? null : (actual_amount ? parseFloat(actual_amount) : undefined),
        remaining_amount: remaining_amount === null ? null : (remaining_amount ? parseFloat(remaining_amount) : undefined),
        amount_unit: amount_unit || undefined,
        appetite_score: appetite_score === null ? null : (appetite_score ? parseInt(appetite_score) : undefined),
        eating_speed: eating_speed === null ? null : (eating_speed || undefined),
        post_meal_behavior: post_meal_behavior === null ? null : (post_meal_behavior || undefined),
        notes: notes === null ? null : (notes || undefined),
        photo_url: photo_url === null ? null : (photo_url || undefined),
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
      console.error('Error updating feeding record:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in PUT /api/feeding-records/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the record belongs to the user before deleting
    const { data: existingRecord, error: existingError } = await supabase
      .from('feeding_records')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (existingError || !existingRecord || existingRecord.user_id !== user.id) {
      return NextResponse.json({ error: 'Record not found or unauthorized' }, { status: 404 })
    }

    // Delete the feeding record
    const { error } = await supabase
      .from('feeding_records')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting feeding record:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Record deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/feeding-records/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}