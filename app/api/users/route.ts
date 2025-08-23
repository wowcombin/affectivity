import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireHR, hashPassword, generateTemporaryPassword, validateBEP20Address, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'
import { UserRole } from '@/types/database'

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  email: z.string().email('Invalid email address'),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['Employee', 'Tester'] as const),
  usdt_address: z.string().optional(),
  usdt_network: z.string().default('BEP20'),
  send_nda: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    // Проверяем права HR
    const currentUser = await requireHR()
    const clientIP = getClientIP(request)
    
    const body = await request.json()
    const userData = createUserSchema.parse(body)
    
    const supabase = createAdminClient()
    
    // Проверяем уникальность username и email
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${userData.username},email.eq.${userData.email}`)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким username или email уже существует' },
        { status: 400 }
      )
    }

    // Валидация USDT адреса если предоставлен
    if (userData.usdt_address && !validateBEP20Address(userData.usdt_address)) {
      return NextResponse.json(
        { error: 'Неверный BEP20 адрес. Адрес должен начинаться с 0x и содержать 42 символа.' },
        { status: 400 }
      )
    }

    // Генерируем временный пароль
    const temporaryPassword = generateTemporaryPassword()
    const hashedPassword = await hashPassword(temporaryPassword)

    // Создаем пользователя
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        email: userData.email,
        password_hash: hashedPassword,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        usdt_address: userData.usdt_address,
        usdt_network: userData.usdt_network,
        is_active: true,
        created_by: currentUser.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Ошибка при создании пользователя' },
        { status: 500 }
      )
    }

    // Создаем запись в таблице employees для Employee и Tester
    if (userData.role === 'Employee' || userData.role === 'Tester') {
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          user_id: newUser.id,
          percentage_rate: 10.00,
          is_active: true
        })

      if (employeeError) {
        console.error('Error creating employee record:', employeeError)
        // Удаляем созданного пользователя если не удалось создать employee
        await supabase.from('users').delete().eq('id', newUser.id)
        return NextResponse.json(
          { error: 'Ошибка при создании записи сотрудника' },
          { status: 500 }
        )
      }
    }

    // Логируем создание пользователя
    await logActivity(
      currentUser.id,
      'user_created',
      {
        created_user_id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        send_nda: userData.send_nda
      },
      clientIP,
      request.headers.get('user-agent')
    )

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role
      },
      temporary_password: temporaryPassword,
      message: 'Пользователь успешно создан'
    })

  } catch (error) {
    console.error('Create user error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные пользователя', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// Получение списка пользователей (только для HR и выше)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireHR()
    const supabase = createAdminClient()
    
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const active = searchParams.get('active')
    
    let query = supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        full_name,
        phone,
        role,
        usdt_address,
        usdt_network,
        is_active,
        created_at,
        last_login,
        created_by,
        employees (
          id,
          percentage_rate,
          total_profit,
          is_active
        )
      `)
      .order('created_at', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }
    
    if (active !== null) {
      query = query.eq('is_active', active === 'true')
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Ошибка при получении списка пользователей' },
        { status: 500 }
      )
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
