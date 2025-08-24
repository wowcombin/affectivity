// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const employeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET EMPLOYEES API CALLED ===')
    
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

    // Проверяем права доступа
    if (!['Admin', 'HR', 'Manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Получаем сотрудников с данными пользователей
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        *,
        user:users (
          username,
          role,
          is_active
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }

    return NextResponse.json({ employees: employees || [] })
  } catch (error) {
    console.error('Error in GET /api/employees:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST EMPLOYEES API CALLED ===')
    
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
    if (!['Admin', 'HR'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = employeeSchema.parse(body)

    // Используем переданные username и password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Создаем пользователя
    const { data: newUser, error: userCreateError } = await supabase
      .from('users')
      .insert({
        username: validatedData.username,
        email: validatedData.email,
        password_hash: hashedPassword,
        role: 'Employee',
        is_active: true,
        created_by: currentUser.id
      })
      .select()
      .single()

    if (userCreateError) {
      console.error('Error creating user:', userCreateError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Создаем сотрудника
    const { data: newEmployee, error: employeeCreateError } = await supabase
      .from('employees')
      .insert({
        user_id: newUser.id,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email,
        phone: '',
        position: 'Employee',
        salary: 0,
        bank_name: '',
        bank_country: '',
        account_number: '',
        sort_code: '',
        card_number: '',
        card_expiry: '',
        card_cvv: '',
        login_url: '',
        login_username: '',
        login_password: '',
        hire_date: new Date().toISOString(),
        is_active: true
      })
      .select(`
        *,
        user:users (
          username,
          role,
          is_active
        )
      `)
      .single()

    if (employeeCreateError) {
      console.error('Error creating employee:', employeeCreateError)
      // Удаляем созданного пользователя в случае ошибки
      await supabase.from('users').delete().eq('id', newUser.id)
      return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
    }

    // Логируем создание сотрудника
    await logActivity(
      currentUser.id,
      'employee_created',
      {
        employee_id: newEmployee.id,
        employee_name: `${validatedData.first_name} ${validatedData.last_name}`,
        username: validatedData.username
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true,
      employee: newEmployee,
      message: 'Employee created successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/employees:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
