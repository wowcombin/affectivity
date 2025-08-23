import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logActivity, getClientIP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const clientIP = getClientIP(request)
    
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Логируем выход
      await logActivity(user.id, 'logout', {}, clientIP, request.headers.get('user-agent'))
    }

    // Выходим из Supabase Auth
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
