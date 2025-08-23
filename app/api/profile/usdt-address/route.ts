// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth, validateBEP20Address, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const updateAddressSchema = z.object({
  usdt_address: z.string().min(1, 'USDT address is required'),
  usdt_network: z.string().default('BEP20')
})

export async function PUT(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const currentUser = await requireAuth()
    const clientIP = getClientIP(request)
    
    const body = await request.json()
    const { usdt_address, usdt_network } = updateAddressSchema.parse(body)
    
    // Валидация BEP20 адреса
    if (!validateBEP20Address(usdt_address)) {
      return NextResponse.json(
        { error: 'Неверный BEP20 адрес. Адрес должен начинаться с 0x и содержать 42 символа.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    // Получаем текущий адрес для логирования
    const { data: currentUserData } = await supabase
      .from('users')
      .select('usdt_address')
      .eq('id', currentUser.id)
      .single()

    const oldAddress = currentUserData?.usdt_address

    // Обновляем адрес
    const { error: updateError } = await supabase
      .from('users')
      .update({
        usdt_address,
        usdt_network,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id)

    if (updateError) {
      console.error('Error updating USDT address:', updateError)
      return NextResponse.json(
        { error: 'Ошибка при обновлении адреса' },
        { status: 500 }
      )
    }

    // Логируем изменение адреса
    await logActivity(
      currentUser.id,
      'usdt_address_updated',
      {
        old_address: oldAddress,
        new_address: usdt_address,
        network: usdt_network
      },
      clientIP,
      request.headers.get('user-agent')
    )

    return NextResponse.json({
      success: true,
      message: 'USDT адрес успешно обновлен',
      usdt_address,
      usdt_network
    })

  } catch (error) {
    console.error('Update USDT address error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные адреса', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// Получение текущего USDT адреса
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth()
    const supabase = createAdminClient()
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('usdt_address, usdt_network')
      .eq('id', currentUser.id)
      .single()

    if (error) {
      console.error('Error fetching USDT address:', error)
      return NextResponse.json(
        { error: 'Ошибка при получении адреса' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      usdt_address: userData.usdt_address,
      usdt_network: userData.usdt_network
    })

  } catch (error) {
    console.error('Get USDT address error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
