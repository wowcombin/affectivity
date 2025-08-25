import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth'
import { logActivity } from '@/lib/auth'
import { z } from 'zod'

const updateUSDTSchema = z.object({
  usdt_address: z.string().min(1, 'USDT address is required'),
  usdt_network: z.enum(['BEP20', 'ERC20', 'TRC20'], {
    errorMap: () => ({ message: 'Invalid USDT network' })
  })
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPDATE USDT API CALLED ===')
    
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

    const body = await request.json()
    const validatedData = updateUSDTSchema.parse(body)

    // Обновляем USDT реквизиты
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        usdt_address: validatedData.usdt_address,
        usdt_network: validatedData.usdt_network
      } as any)
      .eq('id', decoded.userId)

    if (updateError) {
      console.error('Error updating USDT details:', updateError)
      return NextResponse.json({ error: 'Failed to update USDT details' }, { status: 500 })
    }

    // Логируем активность
    await logActivity(
      decoded.userId,
      'usdt_updated',
      { 
        user_role: (currentUser as any)?.role || 'Unknown', 
        details: `USDT address updated to ${validatedData.usdt_address} (${validatedData.usdt_network})` 
      },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true, 
      message: 'USDT details updated successfully' 
    })

  } catch (error) {
    console.error('Error in POST /api/profile/update-usdt:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
