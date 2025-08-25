import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// PUT /api/cards/v2/[id] - обновить карту
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== PUT CARDS V2 API CALLED ===')
    
    const supabase = createAdminClient()
    const body = await request.json()
    
    const {
      bank_account_id,
      card_number,
      expiry_date,
      cvv,
      card_type
    } = body

    // Обновляем карту
    const { data, error } = await supabase
      .from('cards')
      .update({
        bank_account_id,
        card_number,
        expiry_date,
        cvv,
        card_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating card:', error)
      return NextResponse.json({ 
        error: 'Failed to update card',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ card: data })
  } catch (error: any) {
    console.error('Error in PUT /api/cards/v2/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message 
    }, { status: 500 })
  }
}

// DELETE /api/cards/v2/[id] - удалить карту
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== DELETE CARDS V2 API CALLED ===')
    
    const supabase = createAdminClient()

    // Удаляем карту
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting card:', error)
      return NextResponse.json({ 
        error: 'Failed to delete card',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/cards/v2/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message 
    }, { status: 500 })
  }
}
