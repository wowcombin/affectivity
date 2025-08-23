// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const supabase = createAdminClient()

    let query = supabase
      .from('work_files')
      .select('*')
      .order('created_at', { ascending: false })

    // Если не админ/менеджер/HR, показываем только свои записи
    if (!['Admin', 'Manager', 'HR'].includes(user.role)) {
      query = query.eq('employee_id', user.id)
    }

    const { data: workFiles, error } = await query

    if (error) {
      console.error('Error fetching work files:', error)
      return NextResponse.json({ error: 'Failed to fetch work files' }, { status: 500 })
    }

    return NextResponse.json({ workFiles })
  } catch (error) {
    console.error('Error in GET /api/work-files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const supabase = createAdminClient()
    const body = await request.json()

    const {
      month,
      casino_name,
      deposit_amount,
      withdrawal_amount,
      card_number,
      card_expiry,
      card_cvv,
      account_username,
      account_password,
      card_type,
      bank_name,
      withdrawal_question,
      is_draft
    } = body

    // Валидация
    if (!month || !casino_name || !deposit_amount || !withdrawal_amount || 
        !card_number || !card_expiry || !card_cvv || !account_username || 
        !account_password || !card_type || !bank_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const workFileData = {
      employee_id: user.id,
      month,
      casino_name,
      deposit_amount: parseFloat(deposit_amount),
      withdrawal_amount: parseFloat(withdrawal_amount),
      card_number,
      card_expiry,
      card_cvv,
      account_username,
      account_password,
      card_type,
      bank_name,
      withdrawal_status: is_draft ? 'new' : 'new',
      withdrawal_question: withdrawal_question || null,
      is_draft: is_draft || false
    }

    const { data, error } = await supabase
      .from('work_files')
      .insert(workFileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating work file:', error)
      return NextResponse.json({ error: 'Failed to create work file' }, { status: 500 })
    }

    return NextResponse.json({ workFile: data })
  } catch (error) {
    console.error('Error in POST /api/work-files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
