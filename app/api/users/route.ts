// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET USERS API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Проверяем права доступа
    let currentUser
    try {
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

      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(authToken, process.env.SUPABASE_JWT_SECRET)
      
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      currentUser = user
      
      // Только Admin может видеть всех пользователей
      if (currentUser.role !== 'Admin') {
        return NextResponse.json(
          { error: 'Недостаточно прав для просмотра пользователей. Требуется роль Admin.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра пользователей' },
        { status: 403 }
      )
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST USERS API CALLED ===')
    
    const supabase = createAdminClient()
    const body = await request.json()
    
    // Проверяем права доступа
    let currentUser
    try {
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

      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(authToken, process.env.SUPABASE_JWT_SECRET)
      
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      currentUser = user
      
      // Только Admin может создавать пользователей
      if (currentUser.role !== 'Admin') {
        return NextResponse.json(
          { error: 'Недостаточно прав для создания пользователей. Требуется роль Admin.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для создания пользователей' },
        { status: 403 }
      )
    }

    const { username, email, full_name, role, password } = body

    // Валидация
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 })
    }

    // Проверяем, что пользователь с таким username не существует
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'User with this username already exists' }, { status: 400 })
    }

    // Хешируем пароль
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    const userData = {
      username,
      email,
      full_name: full_name || null,
      role: role || 'Employee',
      password_hash: hashedPassword,
      is_active: true,
      created_by: currentUser.id
    }

    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Убираем пароль из ответа
    const { password_hash: _, ...userWithoutPassword } = data

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
