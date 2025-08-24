import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET SESSION API CALLED ===')
    
    // Получаем токен из cookies или заголовка Authorization
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

    // Верифицируем токен
    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Получаем данные пользователя
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, usdt_address, usdt_network, is_active, last_login')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      user,
      session: {
        id: decoded.userId,
        username: user.username,
        role: user.role,
        expiresAt: decoded.exp
      }
    })
  } catch (error) {
    console.error('Error in GET /api/session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
