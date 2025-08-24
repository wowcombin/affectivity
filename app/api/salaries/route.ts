import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET SALARIES API CALLED ===')
    
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

    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Получаем данные пользователя
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем права доступа
    if (!['Admin', 'CFO', 'HR'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Получаем месяц из параметров
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    // Получаем расчеты зарплат
    const { data: calculations, error } = await supabase
      .from('salary_calculations')
      .select('*')
      .eq('month', month)
      .order('calculated_at', { ascending: false })

    if (error) {
      console.error('Error fetching salary calculations:', error)
      return NextResponse.json({ error: 'Failed to fetch salary calculations' }, { status: 500 })
    }

    return NextResponse.json({ calculations: calculations || [] })
  } catch (error) {
    console.error('Error in GET /api/salaries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
