// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET LOGS API CALLED ===')
    
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
      
      // Только Admin может видеть логи
      if (currentUser.role !== 'Admin') {
        return NextResponse.json(
          { error: 'Недостаточно прав для просмотра логов. Требуется роль Admin.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра логов' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const action = searchParams.get('action')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        users (
          username,
          full_name,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching logs:', error)
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }

    return NextResponse.json({ logs: logs || [] })
  } catch (error) {
    console.error('Error in GET /api/logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST LOGS API CALLED ===')
    
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
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для создания логов' },
        { status: 403 }
      )
    }

    const { action, details, ip_address, user_agent } = body

    // Валидация
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const logData = {
      user_id: currentUser.id,
      action,
      details: details || null,
      ip_address: ip_address || null,
      user_agent: user_agent || null
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .insert(logData)
      .select()
      .single()

    if (error) {
      console.error('Error creating log:', error)
      return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
    }

    return NextResponse.json({ log: data })
  } catch (error) {
    console.error('Error in POST /api/logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
