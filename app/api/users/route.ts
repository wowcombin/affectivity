// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireHR, requireAuth, hashPassword, generateTemporaryPassword, validateBEP20Address, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'
import { UserRole } from '@/types/database'

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  email: z.string().email('Invalid email address'),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['Employee', 'Tester', 'Manager', 'HR', 'CFO'] as const),
  usdt_address: z.string().optional(),
  usdt_network: z.string().default('BEP20'),
  send_nda: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE USER API CALLED ===')
    
    // Создаем клиент Supabase в начале
    const supabase = createAdminClient()
    console.log('Supabase client created')
    
    // Проверяем права HR
    console.log('Checking HR permissions...')
    let currentUser
    
    // Простая проверка аутентификации прямо здесь
    let authToken = request.cookies.get('auth-token')?.value
    
    if (!authToken) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7)
      }
    }

    if (!authToken) {
      return NextResponse.json(
        { error: 'No auth token' },
        { status: 401 }
      )
    }

    try {
      // Верифицируем токен
      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(authToken, process.env.SUPABASE_JWT_SECRET)
      
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Получаем пользователя из базы
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      currentUser = user
      console.log('Current user from API auth:', { id: currentUser.id, username: currentUser.username, role: currentUser.role })
      
      // Проверяем роль вручную
      if (!['Admin', 'HR', 'admin', 'hr'].includes(currentUser.role)) {
        console.log('User role not allowed for HR operations:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для создания пользователя. Требуется роль Admin или HR.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('HR permission check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для создания пользователя', details: authError.message },
        { status: 403 }
      )
    }
    
    const clientIP = getClientIP(request)
    console.log('Client IP:', clientIP)
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const userData = createUserSchema.parse(body)
    console.log('Parsed user data:', userData)
    
    // Проверяем уникальность username и email
    console.log('Checking for existing user...')
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${userData.username},email.eq.${userData.email}`)
      .single()

    console.log('Existing user check result:', { existingUser, checkError })

    if (existingUser) {
      console.log('User already exists:', existingUser)
      return NextResponse.json(
        { error: 'Пользователь с таким username или email уже существует' },
        { status: 400 }
      )
    }

    // Валидация USDT адреса если предоставлен
    if (userData.usdt_address && !validateBEP20Address(userData.usdt_address)) {
      console.log('Invalid USDT address:', userData.usdt_address)
      return NextResponse.json(
        { error: 'Неверный BEP20 адрес. Адрес должен начинаться с 0x и содержать 42 символа.' },
        { status: 400 }
      )
    }

    // Генерируем временный пароль
    console.log('Generating temporary password...')
    const temporaryPassword = generateTemporaryPassword()
    const hashedPassword = await hashPassword(temporaryPassword)
    console.log('Password generated and hashed')

    // Создаем пользователя
    console.log('Creating user in database...')
    const userInsertData = {
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
    }
    console.log('User insert data:', userInsertData)
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(userInsertData)
      .select()
      .single()

    console.log('User creation result:', { newUser, createError })

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Ошибка при создании пользователя', details: createError },
        { status: 500 }
      )
    }

    // Создаем запись в таблице salary_calculations для Employee и Tester
    if (userData.role === 'Employee' || userData.role === 'Tester') {
      console.log('Creating salary calculation record for Employee/Tester...')
      const { error: salaryError } = await supabase
        .from('salary_calculations')
        .insert({
          user_id: newUser.id,
          base_salary: 0,
          bonus_percentage: 10.00,
          total_earned: 0,
          is_active: true
        })

      console.log('Salary calculation creation result:', { salaryError })

      if (salaryError) {
        console.error('Error creating salary calculation record:', salaryError)
        // Удаляем созданного пользователя если не удалось создать salary record
        await supabase.from('users').delete().eq('id', newUser.id)
        return NextResponse.json(
          { error: 'Ошибка при создании записи расчета зарплаты', details: salaryError },
          { status: 500 }
        )
      }
    } else {
      console.log('Skipping salary calculation for role:', userData.role)
    }

    // Логируем создание пользователя
    console.log('Logging user creation activity...')
    try {
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
      console.log('Activity logged successfully')
    } catch (logError) {
      console.error('Error logging activity:', logError)
      // Не прерываем создание пользователя из-за ошибки логирования
    }

    console.log('User created successfully:', newUser.username)
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
    console.error('=== CREATE USER ERROR ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors)
      return NextResponse.json(
        { error: 'Неверные данные пользователя', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера', details: error.message },
      { status: 500 }
    )
  }
}

// Получение списка пользователей (только для HR и выше)
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET USERS API CALLED ===')
    
    // Создаем клиент Supabase в начале
    const supabase = createAdminClient()
    console.log('Supabase client created')
    
    // Проверяем права HR
    console.log('Checking HR permissions...')
    let currentUser
    try {
      // Простая проверка аутентификации прямо здесь
      let authToken = request.cookies.get('auth-token')?.value
      
      if (!authToken) {
        const authHeader = request.headers.get('authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
          authToken = authHeader.substring(7)
        }
      }

      if (!authToken) {
        return NextResponse.json(
          { error: 'No auth token' },
          { status: 401 }
        )
      }

      // Верифицируем токен
      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(authToken, process.env.SUPABASE_JWT_SECRET)
      
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Получаем пользователя из базы
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      currentUser = user
      console.log('Current user from API auth:', { id: currentUser.id, username: currentUser.username, role: currentUser.role })
      
      // Проверяем роль вручную
      if (!['Admin', 'HR', 'admin', 'hr'].includes(currentUser.role)) {
        console.log('User role not allowed for HR operations:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для просмотра пользователей. Требуется роль Admin или HR.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('HR permission check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра пользователей', details: authError.message },
        { status: 403 }
      )
    }
    
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
        created_by
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
