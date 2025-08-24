import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['new', 'sent', 'received', 'problem', 'blocked'])
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== PUT WORK FILE STATUS API CALLED ===')
    
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
    const validatedData = statusUpdateSchema.parse(body)

    // Получаем текущую запись
    const { data: currentEntry, error: fetchError } = await supabase
      .from('work_entries')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentEntry) {
      return NextResponse.json({ error: 'Work entry not found' }, { status: 404 })
    }

    // Проверяем права доступа (только владелец записи или менеджер/HR могут обновлять)
    if (currentEntry.user_id !== currentUser.id && !['Manager', 'HR', 'Admin'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Обновляем статус
    const { data: updatedEntry, error: updateError } = await supabase
      .from('work_entries')
      .update({
        withdrawal_status: validatedData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating work entry status:', updateError)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    // Логируем обновление статуса
    await logActivity(
      currentUser.id,
      'work_entry_status_updated',
      {
        entry_id: params.id,
        old_status: currentEntry.withdrawal_status,
        new_status: validatedData.status,
        casino_name: currentEntry.casino_name
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true, 
      entry: updatedEntry,
      message: 'Status updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/work-files/[id]/status:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
