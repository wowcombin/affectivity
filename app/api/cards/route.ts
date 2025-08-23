// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const supabase = createAdminClient()

    // Только CFO, Admin и Manager могут видеть карты
    if (!['Admin', 'CFO', 'Manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: cards, error } = await supabase
      .from('cards')
      .select(`
        *,
        bank_accounts (
          account_name,
          banks (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cards:', error)
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    return NextResponse.json({ cards: cards || [] })
  } catch (error) {
    console.error('Error in GET /api/cards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const supabase = createAdminClient()
    const body = await request.json()

    // Только CFO и Admin могут создавать карты
    if (!['Admin', 'CFO'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const {
      bank_account_id,
      card_number,
      expiry_date,
      cvv,
      card_type
    } = body

    // Валидация
    if (!bank_account_id || !card_number || !expiry_date || !cvv || !card_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['pink', 'gray'].includes(card_type)) {
      return NextResponse.json({ error: 'Invalid card type' }, { status: 400 })
    }

    // Проверяем лимит розовых карт
    if (card_type === 'pink') {
      const { data: account, error: accountError } = await supabase
        .from('bank_accounts')
        .select('pink_cards_remaining, pink_cards_daily_limit')
        .eq('id', bank_account_id)
        .single()

      if (accountError) {
        return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
      }

      if (account.pink_cards_remaining <= 0) {
        return NextResponse.json({ error: 'No pink cards remaining for today' }, { status: 400 })
      }

      // Уменьшаем количество розовых карт
      await supabase
        .from('bank_accounts')
        .update({ pink_cards_remaining: account.pink_cards_remaining - 1 })
        .eq('id', bank_account_id)
    }

    const cardData = {
      bank_account_id,
      card_number,
      expiry_date,
      cvv,
      card_type,
      status: 'free'
    }

    const { data, error } = await supabase
      .from('cards')
      .insert(cardData)
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
    }

    return NextResponse.json({ card: data })
  } catch (error) {
    console.error('Error in POST /api/cards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
