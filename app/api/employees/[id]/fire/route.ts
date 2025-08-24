import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== POST EMPLOYEE FIRE API CALLED ===')
    
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

    // Проверяем права доступа - HR и Manager могут увольнять
    if (!['Admin', 'HR', 'Manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied. Only admins, HR and managers can fire employees.' }, { status: 403 })
    }

    // Получаем данные сотрудника
    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select(`
        *,
        user:users (
          username,
          role
        )
      `)
      .eq('id', params.id)
      .single()

    if (fetchError || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Проверяем, что сотрудник еще активен
    if (!employee.is_active) {
      return NextResponse.json({ error: 'Employee is already inactive' }, { status: 400 })
    }

    // Увольняем сотрудника (устанавливаем is_active = false)
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error firing employee:', updateError)
      return NextResponse.json({ error: 'Failed to fire employee' }, { status: 500 })
    }

    // Также деактивируем пользователя
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        is_active: false
      })
      .eq('id', employee.user_id)

    if (userUpdateError) {
      console.error('Error deactivating user:', userUpdateError)
      // Не возвращаем ошибку, так как сотрудник уже уволен
    }

    // Логируем увольнение
    await logActivity(
      currentUser.id,
      'employee_fired',
      {
        employee_id: params.id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        employee_role: employee.user.role,
        fired_by: currentUser.role
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true,
      employee: updatedEmployee,
      message: 'Employee fired successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/employees/[id]/fire:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
