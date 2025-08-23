// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const supabase = createAdminClient()
    const body = await request.json()
    const { remaining } = body

    // Только CFO и Admin могут обновлять розовые карты
    if (!['Admin', 'CFO'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (typeof remaining !== 'number' || remaining < 0) {
      return NextResponse.json({ error: 'Invalid remaining count' }, { status: 400 })
    }

    // Получаем текущий аккаунт для проверки лимита
    const { data: account, error: fetchError } = await supabase
      .from('bank_accounts')
      .select('pink_cards_daily_limit')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    if (remaining > account.pink_cards_daily_limit) {
      return NextResponse.json({ error: 'Remaining count cannot exceed daily limit' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .update({ 
        pink_cards_remaining: remaining,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating pink cards:', error)
      return NextResponse.json({ error: 'Failed to update pink cards' }, { status: 500 })
    }

    return NextResponse.json({ bankAccount: data })
  } catch (error) {
    console.error('Error in PUT /api/bank-accounts/[id]/pink-cards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
