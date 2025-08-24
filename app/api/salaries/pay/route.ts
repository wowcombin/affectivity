import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const paymentSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)')
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST SALARIES PAY API CALLED ===')
    
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
    if (!['Admin', 'CFO'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    // Получаем рассчитанные зарплаты за месяц
    const { data: calculations, error: calculationsError } = await supabase
      .from('salary_calculations')
      .select('*')
      .eq('month', validatedData.month)
      .eq('status', 'calculated')

    if (calculationsError) {
      console.error('Error fetching salary calculations:', calculationsError)
      return NextResponse.json({ error: 'Failed to fetch salary calculations' }, { status: 500 })
    }

    if (calculations.length === 0) {
      return NextResponse.json({ error: 'No calculated salaries found for this month' }, { status: 400 })
    }

    // Обновляем статус на "выплачено"
    const { data: updatedCalculations, error: updateError } = await supabase
      .from('salary_calculations')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('month', validatedData.month)
      .eq('status', 'calculated')
      .select()

    if (updateError) {
      console.error('Error updating salary calculations:', updateError)
      return NextResponse.json({ error: 'Failed to update salary calculations' }, { status: 500 })
    }

    // Логируем выплату зарплат
    await logActivity(
      currentUser.id,
      'salaries_paid',
      {
        month: validatedData.month,
        paid_count: updatedCalculations.length,
        total_amount: updatedCalculations.reduce((sum, calc) => sum + calc.total_salary, 0),
        total_usd: updatedCalculations.reduce((sum, calc) => sum + calc.usd_amount, 0)
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true,
      paid_calculations: updatedCalculations,
      message: `Зарплаты выплачены для ${updatedCalculations.length} сотрудников` 
    })
  } catch (error) {
    console.error('Error in POST /api/salaries/pay:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
