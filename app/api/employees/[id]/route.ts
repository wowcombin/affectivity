import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const employeeUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  position: z.string().min(1, 'Position is required'),
  salary: z.number().positive('Salary must be positive'),
  bank_name: z.string().min(1, 'Bank name is required'),
  bank_country: z.string().min(1, 'Bank country is required'),
  account_number: z.string().min(1, 'Account number is required'),
  sort_code: z.string().min(1, 'Sort code is required'),
  card_number: z.string().min(1, 'Card number is required'),
  card_expiry: z.string().min(1, 'Card expiry is required'),
  card_cvv: z.string().min(1, 'Card CVV is required'),
  login_url: z.string().url('Valid login URL is required'),
  login_username: z.string().min(1, 'Login username is required'),
  login_password: z.string().min(1, 'Login password is required')
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== PUT EMPLOYEE API CALLED ===')
    
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
    if (!['Admin', 'HR', 'Manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = employeeUpdateSchema.parse(body)

    // Получаем текущего сотрудника
    const { data: currentEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Обновляем данные сотрудника
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update({
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email,
        phone: validatedData.phone,
        position: validatedData.position,
        salary: validatedData.salary,
        bank_name: validatedData.bank_name,
        bank_country: validatedData.bank_country,
        account_number: validatedData.account_number,
        sort_code: validatedData.sort_code,
        card_number: validatedData.card_number,
        card_expiry: validatedData.card_expiry,
        card_cvv: validatedData.card_cvv,
        login_url: validatedData.login_url,
        login_username: validatedData.login_username,
        login_password: validatedData.login_password,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating employee:', updateError)
      return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
    }

    // Логируем обновление сотрудника
    await logActivity(
      currentUser.id,
      'employee_updated',
      {
        employee_id: params.id,
        employee_name: `${validatedData.first_name} ${validatedData.last_name}`,
        updated_fields: Object.keys(validatedData)
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true, 
      employee: updatedEmployee,
      message: 'Employee updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/employees/[id]:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== DELETE EMPLOYEE API CALLED ===')
    
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

    // Проверяем права доступа - только админ может удалять
    if (currentUser.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied. Only admins can delete employees.' }, { status: 403 })
    }

    // Получаем данные сотрудника перед удалением
    const { data: employeeToDelete, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !employeeToDelete) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Удаляем сотрудника
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting employee:', deleteError)
      return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
    }

    // Логируем удаление сотрудника
    await logActivity(
      currentUser.id,
      'employee_deleted',
      {
        employee_id: params.id,
        employee_name: `${employeeToDelete.first_name} ${employeeToDelete.last_name}`,
        deleted_by: currentUser.username
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true,
      message: 'Employee deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/employees/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
