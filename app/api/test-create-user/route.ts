// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword, generateTemporaryPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST CREATE USER API CALLED ===')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { username, email, full_name, role } = body
    
    if (!username || !email || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['username', 'email', 'role']
      }, { status: 400 })
    }
    
    const supabase = createAdminClient()
    console.log('Supabase client created')
    
    // Проверяем уникальность username и email
    console.log('Checking for existing user...')
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`)
      .single()

    console.log('Existing user check result:', { existingUser, checkError })

    if (existingUser) {
      console.log('User already exists:', existingUser)
      return NextResponse.json(
        { error: 'Пользователь с таким username или email уже существует' },
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
      username,
      email,
      password_hash: hashedPassword,
      full_name: full_name || null,
      phone: null,
      role,
      usdt_address: null,
      usdt_network: 'BEP20',
      is_active: true,
      created_by: '1' // admin user ID
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
    console.error('=== TEST CREATE USER ERROR ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера', details: error.message },
      { status: 500 }
    )
  }
}
