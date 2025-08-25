import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET CARDS V2 API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Получаем все карты с информацией о банках
    const { data: cards, error } = await supabase
      .from('cards')
      .select(`
        *,
        bank_accounts (
          id,
          account_name,
          banks (
            id,
            name,
            country
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cards:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch cards', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ cards: cards || [] })
  } catch (error: any) {
    console.error('Error in GET /api/cards/v2:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST CARDS V2 API CALLED ===')
    
    const supabase = createAdminClient()
    const body = await request.json()
    
    const {
      bank_account_id,
      card_number,
      expiry_date,
      cvv,
      card_type = 'gray'
    } = body

    // Валидация
    if (!bank_account_id || !card_number || !expiry_date || !cvv) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Создаем карту
    const { data, error } = await supabase
      .from('cards')
      .insert({
        bank_account_id,
        card_number,
        expiry_date,
        cvv,
        card_type,
        status: 'free',
        deposit_amount: 0,
        withdrawal_amount: 0,
        profit: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      return NextResponse.json({ 
        error: 'Failed to create card',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ card: data })
  } catch (error: any) {
    console.error('Error in POST /api/cards/v2:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message 
    }, { status: 500 })
  }
}
