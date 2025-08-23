// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { requireCFO } from '@/lib/auth'
import { calculateAllSalaries, getDashboardStats } from '@/lib/salary-calculator'
import { z } from 'zod'

const calculateSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
})

export async function POST(request: NextRequest) {
  try {
    // Проверяем права CFO
    const currentUser = await requireCFO()
    
    const body = await request.json()
    const { month } = calculateSchema.parse(body)
    
    // Выполняем расчет зарплат
    const result = await calculateAllSalaries(month)
    
    return NextResponse.json({
      success: true,
      message: 'Расчет зарплат выполнен успешно',
      result
    })

  } catch (error) {
    console.error('Calculate salaries error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверный формат месяца. Используйте YYYY-MM' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка при расчете зарплат' },
      { status: 500 }
    )
  }
}

// Получение статистики для дашборда
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)
    
    const stats = await getDashboardStats(month)
    
    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении статистики' },
      { status: 500 }
    )
  }
}
