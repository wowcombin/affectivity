// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const supabase = createAdminClient()

    // Только CFO и Admin могут видеть банковские аккаунты
    if (!['Admin', 'CFO'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: bankAccounts, error } = await supabase
      .from('bank_accounts')
      .select(`
        *,
        cards:cards (
          id,
          card_number,
          card_expiry,
          card_cvv,
          card_type,
          is_active,
          assigned_to,
          assigned_site,
          times_assigned,
          times_worked,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bank accounts:', error)
      return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 })
    }

    return NextResponse.json({ bankAccounts })
  } catch (error) {
    console.error('Error in GET /api/bank-accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const supabase = createAdminClient()
    const body = await request.json()

    // Только CFO и Admin могут создавать банковские аккаунты
    if (!['Admin', 'CFO'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const {
      bank_id,
      account_name,
      account_number,
      sort_code,
      login_url,
      login_password,
      bank_address
    } = body

    // Валидация
    if (!bank_id || !account_name || !account_number || !sort_code || !login_url || !login_password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const accountData = {
      bank_id,
      account_name,
      account_number,
      sort_code,
      login_url,
      login_password,
      bank_address: bank_address || '',
      pink_cards_daily_limit: 5,
      pink_cards_remaining: 5,
      last_reset_date: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(accountData)
      .select()
      .single()

    if (error) {
      console.error('Error creating bank account:', error)
      return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 })
    }

    return NextResponse.json({ bankAccount: data })
  } catch (error) {
    console.error('Error in POST /api/bank-accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
