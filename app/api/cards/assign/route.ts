// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('=== ASSIGN CARD API CALLED ===')
    
    const supabase = createAdminClient()
    const body = await request.json()
    
    // Проверяем права доступа
    let currentUser
    try {
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

      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(authToken, process.env.SUPABASE_JWT_SECRET)
      
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      currentUser = user
      
      // Только Admin, CFO и Manager могут назначать карты
      if (!['Admin', 'CFO', 'Manager'].includes(currentUser.role)) {
        return NextResponse.json(
          { error: 'Недостаточно прав для назначения карт. Требуется роль Admin, CFO или Manager.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для назначения карт' },
        { status: 403 }
      )
    }

    const { card_id, employee_id, casino_id } = body

    // Валидация
    if (!card_id || !employee_id || !casino_id) {
      return NextResponse.json({ error: 'Card ID, Employee ID and Casino ID are required' }, { status: 400 })
    }

    // Проверяем, что карта существует и свободна
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', card_id)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (card.status !== 'free') {
      return NextResponse.json({ error: 'Card is not available for assignment' }, { status: 400 })
    }

    // Проверяем, что сотрудник существует
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employee_id)
      .eq('is_active', true)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json({ error: 'Employee not found or inactive' }, { status: 404 })
    }

    // Проверяем, что казино существует
    const { data: casino, error: casinoError } = await supabase
      .from('casinos')
      .select('*')
      .eq('id', casino_id)
      .eq('is_active', true)
      .single()

    if (casinoError || !casino) {
      return NextResponse.json({ error: 'Casino not found or inactive' }, { status: 404 })
    }

    // Назначаем карту
    const { data: updatedCard, error: updateError } = await supabase
      .from('cards')
      .update({
        status: 'assigned',
        assigned_employee_id: employee_id,
        assigned_casino_id: casino_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', card_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error assigning card:', updateError)
      return NextResponse.json({ error: 'Failed to assign card' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      card: updatedCard,
      message: 'Card assigned successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/cards/assign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('=== UNASSIGN CARD API CALLED ===')
    
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const card_id = searchParams.get('card_id')
    
    // Проверяем права доступа
    let currentUser
    try {
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

      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(authToken, process.env.SUPABASE_JWT_SECRET)
      
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      currentUser = user
      
      // Только Admin, CFO и Manager могут снимать назначения карт
      if (!['Admin', 'CFO', 'Manager'].includes(currentUser.role)) {
        return NextResponse.json(
          { error: 'Недостаточно прав для снятия назначения карт. Требуется роль Admin, CFO или Manager.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для снятия назначения карт' },
        { status: 403 }
      )
    }

    if (!card_id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
    }

    // Проверяем, что карта существует и назначена
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', card_id)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (card.status !== 'assigned') {
      return NextResponse.json({ error: 'Card is not assigned' }, { status: 400 })
    }

    // Снимаем назначение карты
    const { data: updatedCard, error: updateError } = await supabase
      .from('cards')
      .update({
        status: 'free',
        assigned_employee_id: null,
        assigned_casino_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', card_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error unassigning card:', updateError)
      return NextResponse.json({ error: 'Failed to unassign card' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      card: updatedCard,
      message: 'Card unassigned successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/cards/assign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
