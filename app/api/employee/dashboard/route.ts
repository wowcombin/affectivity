import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET EMPLOYEE DASHBOARD API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Получаем текущий месяц и год
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    
    // Получаем время до конца месяца
    const endOfMonth = new Date(currentYear, currentMonth, 0)
    const timeToEnd = endOfMonth.getTime() - now.getTime()
    const daysToEnd = Math.floor(timeToEnd / (1000 * 60 * 60 * 24))
    const hoursToEnd = Math.floor((timeToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutesToEnd = Math.floor((timeToEnd % (1000 * 60 * 60)) / (1000 * 60))
    
    // Получаем топ 5 сотрудников текущего месяца
    const { data: monthlyLeaders } = await supabase
      .from('transactions')
      .select(`
        employee_id,
        profit,
        users!inner (
          username
        )
      `)
      .eq('status', 'completed')
      .gte('created_at', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
      .order('profit', { ascending: false })
      .limit(50)
    
    // Группируем по сотрудникам
    const leadersByEmployee = monthlyLeaders?.reduce((acc: any, transaction: any) => {
      const username = transaction.users?.username || 'Unknown'
      if (!acc[username]) {
        acc[username] = 0
      }
      acc[username] += transaction.profit || 0
      return acc
    }, {}) || {}
    
    const topLeaders = Object.entries(leadersByEmployee)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map((entry: any, index) => ({
        position: index + 1,
        username: entry[0],
        totalProfit: entry[1]
      }))
    
    // Получаем топ 5 казино текущего месяца
    const { data: casinoTransactions } = await supabase
      .from('transactions')
      .select(`
        casino_id,
        profit,
        casinos!inner (
          name
        )
      `)
      .eq('status', 'completed')
      .gte('created_at', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
      .order('profit', { ascending: false })
      .limit(50)
    
    // Группируем по казино
    const profitsByCasino = casinoTransactions?.reduce((acc: any, transaction: any) => {
      const casinoName = transaction.casinos?.name || 'Unknown'
      if (!acc[casinoName]) {
        acc[casinoName] = 0
      }
      acc[casinoName] += transaction.profit || 0
      return acc
    }, {}) || {}
    
    const topCasinos = Object.entries(profitsByCasino)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map((entry: any, index) => ({
        position: index + 1,
        name: entry[0],
        totalProfit: entry[1]
      }))
    
    // Получаем топ 5 аккаунтов (транзакций) текущего месяца
    const { data: topAccountsData } = await supabase
      .from('transactions')
      .select(`
        id,
        profit,
        casinos!inner (
          name
        ),
        users!inner (
          username
        )
      `)
      .eq('status', 'completed')
      .gte('created_at', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
      .order('profit', { ascending: false })
      .limit(5)
    
    const topAccounts = topAccountsData?.map((transaction: any, index) => ({
      position: index + 1,
      casino: transaction.casinos?.name || 'Unknown',
      username: transaction.users?.username || 'Unknown',
      profit: transaction.profit || 0
    })) || []
    
    // Получаем последние транзакции
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        profit,
        created_at,
        updated_at,
        users!inner (
          username
        ),
        casinos!inner (
          name
        )
      `)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(10)
    
    const formattedTransactions = recentTransactions?.map((t: any) => ({
      id: t.id,
      username: t.users?.username || 'Unknown',
      casino: t.casinos?.name || 'Unknown',
      profit: t.profit || 0,
      timeToWithdrawal: calculateTimeToWithdrawal(t.created_at, t.updated_at),
      withdrawalDate: new Date(t.updated_at).toLocaleDateString()
    })) || []
    
    // Считаем общую прибыль за месяц
    const { data: totalProfitData } = await supabase
      .from('transactions')
      .select('profit')
      .eq('status', 'completed')
      .gte('created_at', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
    
    const totalProfit = totalProfitData?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0
    
    const dashboardData = {
      currentMonthProfit: totalProfit,
      totalProfit: totalProfit,
      monthlyLeaders: topLeaders,
      topCasinos: topCasinos,
      topAccounts: topAccounts,
      recentTransactions: formattedTransactions,
      timeToEndOfMonth: {
        days: daysToEnd,
        hours: hoursToEnd,
        minutes: minutesToEnd
      }
    }
    
    return NextResponse.json(dashboardData)
  } catch (error: any) {
    console.error('Error in GET /api/employee/dashboard:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message 
    }, { status: 500 })
  }
}

function calculateTimeToWithdrawal(createdAt: string, updatedAt: string): string {
  const created = new Date(createdAt)
  const updated = new Date(updatedAt)
  const diff = updated.getTime() - created.getTime()
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  return `${minutes}м`
}
