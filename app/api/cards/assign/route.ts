// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const assignmentSchema = z.object({
  cardIds: z.array(z.string()).min(1, 'At least one card must be selected'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  siteId: z.string().min(1, 'Site ID is required')
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST CARDS ASSIGN API CALLED ===')
    
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

    // Проверяем права доступа
    if (!['Admin', 'CFO', 'Manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = assignmentSchema.parse(body)

    // Получаем информацию о сотруднике
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('first_name, last_name, username')
      .eq('id', validatedData.employeeId)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Получаем информацию о сайте
    const { data: site, error: siteError } = await supabase
      .from('test_sites')
      .select('casino_name')
      .eq('id', validatedData.siteId)
      .single()

    if (siteError || !site) {
      return NextResponse.json({ error: 'Test site not found' }, { status: 404 })
    }

    // Обновляем карты
    const { data: updatedCards, error: updateError } = await supabase
      .from('cards')
      .update({
        assigned_to: `${employee.first_name} ${employee.last_name} (${employee.username})`,
        assigned_site: site.casino_name,
        times_assigned: supabase.sql`times_assigned + 1`,
        updated_at: new Date().toISOString()
      })
      .in('id', validatedData.cardIds)
      .select()

    if (updateError) {
      console.error('Error updating cards:', updateError)
      return NextResponse.json({ error: 'Failed to assign cards' }, { status: 500 })
    }

    // Логируем назначение карт
    await logActivity(
      currentUser.id,
      'cards_assigned',
      {
        card_count: validatedData.cardIds.length,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        site_name: site.casino_name,
        card_ids: validatedData.cardIds
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true,
      assigned_cards: updatedCards,
      message: `${validatedData.cardIds.length} карт успешно назначено сотруднику ${employee.first_name} ${employee.last_name} на сайт ${site.casino_name}` 
    })
  } catch (error) {
    console.error('Error in POST /api/cards/assign:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

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
