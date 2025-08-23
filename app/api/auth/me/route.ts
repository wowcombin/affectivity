// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 })
    }

    // Верифицируем токен
    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Получаем данные пользователя
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, usdt_address, is_active, hired_date, fired_date, hr_notes')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in GET /api/auth/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
