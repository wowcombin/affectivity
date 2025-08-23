// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireManager, canFireEmployee, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const fireEmployeeSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  reason: z.string().min(1, 'Reason is required'),
  comments: z.string().optional(),
  last_working_day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  block_ips: z.boolean().default(true),
  revoke_cards: z.boolean().default(true),
  archive_data: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    // Проверяем права Manager
    const currentUser = await requireManager()
    const clientIP = getClientIP(request)
    
    const body = await request.json()
    const fireData = fireEmployeeSchema.parse(body)
    
    const supabase = createAdminClient()
    
    // Получаем данные сотрудника
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        id,
        user_id,
        is_active,
        users!inner (
          id,
          username,
          full_name,
          role,
          email,
          phone,
          created_at
        )
      `)
      .eq('id', fireData.employee_id)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      )
    }

    if (!employee.is_active) {
      return NextResponse.json(
        { error: 'Сотрудник уже уволен' },
        { status: 400 }
      )
    }

    // Проверяем права на увольнение
    if (!canFireEmployee(currentUser.role as any, employee.users.role as any)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для увольнения этого сотрудника' },
        { status: 403 }
      )
    }

    // Получаем IP адреса сотрудника
    const { data: employeeIPs } = await supabase
      .from('user_sessions')
      .select('ip_address')
      .eq('user_id', employee.user_id)
      .not('ip_address', 'is', null)

    const uniqueIPs = [...new Set(employeeIPs?.map(session => session.ip_address).filter(Boolean) || [])]

    // Получаем общий заработок сотрудника
    const { data: totalEarnings } = await supabase
      .from('salaries')
      .select('total_salary')
      .eq('employee_id', employee.id)

    const totalEarned = totalEarnings?.reduce((sum, salary) => sum + salary.total_salary, 0) || 0

    // Получаем последнюю зарплату
    const { data: lastSalary } = await supabase
      .from('salaries')
      .select('total_salary')
      .eq('employee_id', employee.id)
      .order('month', { ascending: false })
      .limit(1)
      .single()

    // Архивируем данные сотрудника
    const { error: archiveError } = await supabase
      .from('fired_employees_archive')
      .insert({
        employee_id: employee.id,
        username: employee.users.username,
        full_name: employee.users.full_name,
        role: employee.users.role,
        hire_date: employee.users.created_at,
        fire_date: new Date().toISOString(),
        fire_reason: fireData.reason,
        fired_by: currentUser.id,
        total_earned: totalEarned,
        last_salary: lastSalary?.total_salary || 0,
        documents_archived: fireData.archive_data
      })

    if (archiveError) {
      console.error('Error archiving employee:', archiveError)
      return NextResponse.json(
        { error: 'Ошибка при архивировании данных сотрудника' },
        { status: 500 }
      )
    }

    // Деактивируем аккаунт сотрудника
    const { error: deactivateError } = await supabase
      .from('employees')
      .update({
        is_active: false,
        fired_at: new Date().toISOString(),
        fired_by: currentUser.id,
        fire_reason: fireData.reason,
        last_working_day: fireData.last_working_day
      })
      .eq('id', employee.id)

    if (deactivateError) {
      console.error('Error deactivating employee:', deactivateError)
      return NextResponse.json(
        { error: 'Ошибка при деактивации сотрудника' },
        { status: 500 }
      )
    }

    // Деактивируем пользователя
    const { error: deactivateUserError } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', employee.user_id)

    if (deactivateUserError) {
      console.error('Error deactivating user:', deactivateUserError)
    }

    // Блокируем IP адреса если требуется
    if (fireData.block_ips && uniqueIPs.length > 0) {
      for (const ip of uniqueIPs) {
        await supabase
          .from('blocked_ips')
          .insert({
            ip_address: ip,
            blocked_reason: `Увольнение сотрудника ${employee.users.username}`,
            related_employee_id: employee.id,
            blocked_by: currentUser.id,
            is_active: true
          })
      }
    }

    // Отзываем доступ к картам если требуется
    if (fireData.revoke_cards) {
      const { error: revokeError } = await supabase
        .from('cards')
        .update({
          status: 'blocked',
          assigned_to: null,
          assigned_at: null
        })
        .eq('assigned_to', employee.id)

      if (revokeError) {
        console.error('Error revoking cards:', revokeError)
      }
    }

    // Закрываем все активные сессии
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', employee.user_id)

    if (sessionError) {
      console.error('Error closing sessions:', sessionError)
    }

    // Логируем увольнение
    await logActivity(
      currentUser.id,
      'employee_fired',
      {
        fired_employee_id: employee.id,
        fired_username: employee.users.username,
        reason: fireData.reason,
        ips_blocked: fireData.block_ips ? uniqueIPs.length : 0,
        cards_revoked: fireData.revoke_cards,
        data_archived: fireData.archive_data
      },
      clientIP,
      request.headers.get('user-agent')
    )

    return NextResponse.json({
      success: true,
      message: 'Сотрудник успешно уволен',
      details: {
        employee_id: employee.id,
        username: employee.users.username,
        ips_blocked: fireData.block_ips ? uniqueIPs.length : 0,
        cards_revoked: fireData.revoke_cards,
        data_archived: fireData.archive_data
      }
    })

  } catch (error) {
    console.error('Fire employee error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные для увольнения', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
