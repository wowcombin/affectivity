// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/auth/me called')
    
    // Получаем токен из cookies
    const authToken = request.cookies.get('auth-token')?.value
    console.log('Auth token present:', !!authToken)

    if (!authToken) {
      console.log('No auth token found')
      return NextResponse.json({ error: 'No auth token' }, { status: 401 })
    }

    // Верифицируем токен
    const decoded = verifyToken(authToken)
    console.log('Token decoded:', decoded)

    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('Decoded userId:', decoded.userId)

    const supabase = createAdminClient()

    // Получаем данные пользователя
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, usdt_address, is_active, hired_date, fired_date, hr_notes')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    console.log('User query result:', { user, error })

    if (error || !user) {
      console.log('User not found or error:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User found:', user.username, user.role)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in GET /api/auth/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
