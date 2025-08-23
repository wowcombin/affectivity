// @ts-nocheck
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPassword, generateToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = loginSchema.parse(body)
    
    const supabase = createAdminClient()
    const clientIP = getClientIP(request)
    
    // Получаем пользователя по username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (userError || !user) {
      await logActivity(null, 'login_failed', { username, reason: 'user_not_found' }, clientIP || undefined, request.headers.get('user-agent') || undefined)
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    // Проверяем пароль
    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      await logActivity(null, 'login_failed', { username, reason: 'invalid_password' }, clientIP || undefined, request.headers.get('user-agent') || undefined)
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    // Обновляем время последнего входа
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Генерируем JWT токен
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    })

    // Логируем успешный вход
    await logActivity(user.id, 'login_success', { username }, clientIP || undefined, request.headers.get('user-agent') || undefined)

    // Создаем сессию в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password // Используем оригинальный пароль для Supabase Auth
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      // Продолжаем без Supabase Auth, используя наш JWT
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        usdt_address: user.usdt_address,
        usdt_network: user.usdt_network
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные для входа' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
