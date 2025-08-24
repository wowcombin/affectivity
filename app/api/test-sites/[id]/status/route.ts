import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['active', 'processing', 'testing'])
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== PUT TEST SITE STATUS API CALLED ===')
    
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
    if (!['Tester', 'Manager', 'Admin'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = statusUpdateSchema.parse(body)

    // Получаем текущий сайт
    const { data: currentSite, error: fetchError } = await supabase
      .from('test_sites')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentSite) {
      return NextResponse.json({ error: 'Test site not found' }, { status: 404 })
    }

    // Обновляем статус
    const { data: updatedSite, error: updateError } = await supabase
      .from('test_sites')
      .update({
        status: validatedData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating test site status:', updateError)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    // Логируем обновление статуса
    await logActivity(
      currentUser.id,
      'test_site_status_updated',
      {
        site_id: params.id,
        old_status: currentSite.status,
        new_status: validatedData.status,
        casino_name: currentSite.casino_name
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true, 
      site: updatedSite,
      message: 'Status updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/test-sites/[id]/status:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
