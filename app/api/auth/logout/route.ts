import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGOUT API CALLED ===')
    
    const supabase = createAdminClient()
    const clientIP = getClientIP(request)
    
    // Получаем токен из cookies или заголовка Authorization
    let authToken = request.cookies.get('auth-token')?.value
    
    if (!authToken) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7)
      }
    }

    if (authToken) {
      // Верифицируем токен для получения информации о пользователе
      const decoded = verifyToken(authToken)
      if (decoded) {
        // Логируем выход
        await logActivity(decoded.userId, 'logout', {}, clientIP || undefined, request.headers.get('user-agent') || undefined)
        console.log('Logout logged for user:', decoded.userId)
      }
    }

    const response = NextResponse.json({ success: true })
    
    // Удаляем cookie
    response.cookies.set('auth-token', '', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    console.log('Logout successful')
    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
