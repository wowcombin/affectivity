// @ts-nocheck

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    const { data: cards, error } = await supabase
      .from('cards')
      .select(`
        *,
        casinos (
          name,
          url
        ),
        employees (
          users (
            username,
            full_name
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
    console.error('Error in cards GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем права доступа
    if (!['Admin', 'Manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { card_number, card_type, expiry_date, cvv, balance_usd, casino_id, employee_id } = body

    if (!card_number || !card_type || !expiry_date || !cvv || !casino_id || !employee_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    const { data: card, error } = await supabase
      .from('cards')
      .insert({
        card_number,
        card_type,
        expiry_date,
        cvv,
        balance_usd: balance_usd || 0,
        status: 'active',
        casino_id,
        employee_id,
        added_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
    }

    return NextResponse.json({ card })
  } catch (error) {
    console.error('Error in cards POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
