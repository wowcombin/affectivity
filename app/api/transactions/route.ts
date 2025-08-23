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
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        casinos (
          name,
          url
        ),
        cards (
          card_number,
          card_type
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
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json({ transactions: transactions || [] })
  } catch (error) {
    console.error('Error in transactions GET:', error)
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
    if (!['Admin', 'Manager', 'CFO'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { amount_usd, transaction_type, casino_id, card_id, employee_id } = body

    if (!amount_usd || !transaction_type || !casino_id || !card_id || !employee_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        amount_usd,
        transaction_type,
        status: 'pending',
        casino_id,
        card_id,
        employee_id,
        added_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Error in transactions POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
