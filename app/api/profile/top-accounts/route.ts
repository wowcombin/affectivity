import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TOP ACCOUNTS API CALLED ===')
    
    // Проверяем аутентификацию
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

    const supabase = createClient()
    
    // Получаем данные пользователя
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Получаем топ аккаунты по общему заработку
    const { data: topAccounts, error } = await supabase
      .from('salary_calculations')
      .select(`
        employee_id,
        employee_name,
        total_salary,
        month
      `)
      .order('total_salary', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching top accounts:', error)
      return NextResponse.json({ 
        accounts: [],
        error: 'Failed to fetch top accounts' 
      })
    }

    // Группируем по сотрудникам и суммируем заработок
    const accountsMap = new Map()
    
    ;(topAccounts || []).forEach((account: any) => {
      if (accountsMap.has(account.employee_id)) {
        const existing = accountsMap.get(account.employee_id)
        existing.total_earnings += account.total_salary || 0
        existing.transactions_count += 1
      } else {
        accountsMap.set(account.employee_id, {
          id: account.employee_id,
          username: account.employee_name?.split(' ')[0] || 'Unknown',
          full_name: account.employee_name || 'Unknown',
          total_earnings: account.total_salary || 0,
          transactions_count: 1,
          last_activity: account.month
        })
      }
    })

    // Сортируем по общему заработку
    const formattedAccounts = Array.from(accountsMap.values())
      .sort((a, b) => b.total_earnings - a.total_earnings)
      .slice(0, 10)

    return NextResponse.json({ 
      accounts: formattedAccounts 
    })

  } catch (error) {
    console.error('Error in GET /api/profile/top-accounts:', error)
    return NextResponse.json({ 
      accounts: [],
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
