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
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Проверяем права доступа
    const { data: workFile, error: fetchError } = await supabase
      .from('work_files')
      .select('employee_id, withdrawal_status')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Work file not found' }, { status: 404 })
    }

    // Только владелец записи или менеджер/админ может обновлять статус
    if (workFile.employee_id !== user.id && !['Admin', 'Manager', 'HR'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('work_files')
      .update({ 
        withdrawal_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating work file status:', error)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ workFile: data })
  } catch (error) {
    console.error('Error in PUT /api/work-files/[id]/status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
