// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const supabase = createAdminClient()

    // Только CFO и Admin могут видеть банки
    if (!['Admin', 'CFO'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: banks, error } = await supabase
      .from('banks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching banks:', error)
      return NextResponse.json({ error: 'Failed to fetch banks' }, { status: 500 })
    }

    return NextResponse.json({ banks })
  } catch (error) {
    console.error('Error in GET /api/banks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const supabase = createAdminClient()
    const body = await request.json()

    // Только CFO и Admin могут создавать банки
    if (!['Admin', 'CFO'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { name, type } = body

    // Валидация
    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    if (!['revolut', 'uk', 'other'].includes(type)) {
      return NextResponse.json({ error: 'Invalid bank type' }, { status: 400 })
    }

    const bankData = {
      name,
      type
    }

    const { data, error } = await supabase
      .from('banks')
      .insert(bankData)
      .select()
      .single()

    if (error) {
      console.error('Error creating bank:', error)
      return NextResponse.json({ error: 'Failed to create bank' }, { status: 500 })
    }

    return NextResponse.json({ bank: data })
  } catch (error) {
    console.error('Error in POST /api/banks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
