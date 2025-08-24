import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const workEntrySchema = z.object({
  casino_name: z.string().min(1, 'Casino name is required'),
  deposit_amount: z.number().positive('Deposit amount must be positive'),
  withdrawal_amount: z.number().positive('Withdrawal amount must be positive'),
  card_number: z.string().min(1, 'Card number is required'),
  card_expiry: z.string().min(1, 'Card expiry is required'),
  card_cvv: z.string().min(1, 'Card CVV is required'),
  account_username: z.string().min(1, 'Account username is required'),
  account_password: z.string().min(1, 'Account password is required'),
  card_type: z.enum(['pink', 'gray']),
  bank_name: z.string().min(1, 'Bank name is required'),
  withdrawal_status: z.enum(['new', 'sent', 'received', 'problem', 'blocked']).default('new'),
  issue_description: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET WORK FILES API CALLED ===')
    
    let authToken = request.cookies.get('auth-token')?.value
    
    if (!authToken) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7)
      }
    }

    if (!authToken) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 })
    }

    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Получаем данные пользователя
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Получаем записи о работе
    let query = supabase
      .from('work_entries')
      .select(`
        *,
        user:users (
          username,
          role
        )
      `)
      .order('created_at', { ascending: false })

    // Если админ - показываем все записи, иначе только свои
    if (currentUser.role === 'Admin') {
      query = query
        .gte('created_at', new Date().toISOString().slice(0, 7) + '-01')
        .lte('created_at', new Date().toISOString().slice(0, 7) + '-31')
    } else {
      query = query
        .eq('user_id', currentUser.id)
        .gte('created_at', new Date().toISOString().slice(0, 7) + '-01')
        .lte('created_at', new Date().toISOString().slice(0, 7) + '-31')
    }

    const { data: entries, error } = await query

    if (error) {
      console.error('Error fetching work entries:', error)
      return NextResponse.json({ error: 'Failed to fetch work entries' }, { status: 500 })
    }

    return NextResponse.json({ entries: entries || [] })
  } catch (error) {
    console.error('Error in GET /api/work-files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST WORK FILES API CALLED ===')
    
    let authToken = request.cookies.get('auth-token')?.value
    
    if (!authToken) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7)
      }
    }

    if (!authToken) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 })
    }

    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const clientIP = getClientIP(request)
    
    // Получаем данные пользователя
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = workEntrySchema.parse(body)

    // Создаем новую запись о работе
    const { data: newEntry, error: insertError } = await supabase
      .from('work_entries')
      .insert({
        user_id: currentUser.id,
        casino_name: validatedData.casino_name,
        deposit_amount: validatedData.deposit_amount,
        withdrawal_amount: validatedData.withdrawal_amount,
        card_number: validatedData.card_number,
        card_expiry: validatedData.card_expiry,
        card_cvv: validatedData.card_cvv,
        account_username: validatedData.account_username,
        account_password: validatedData.account_password,
        card_type: validatedData.card_type,
        bank_name: validatedData.bank_name,
        withdrawal_status: validatedData.withdrawal_status,
        issue_description: validatedData.issue_description
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating work entry:', insertError)
      return NextResponse.json({ error: 'Failed to create work entry' }, { status: 500 })
    }

    // Логируем создание записи
    await logActivity(
      currentUser.id,
      'work_entry_created',
      {
        entry_id: newEntry.id,
        casino_name: validatedData.casino_name,
        deposit_amount: validatedData.deposit_amount,
        withdrawal_amount: validatedData.withdrawal_amount
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true, 
      entry: newEntry,
      message: 'Work entry created successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/work-files:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
