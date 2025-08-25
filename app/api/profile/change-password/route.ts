import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth'
import { logActivity } from '@/lib/auth'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== CHANGE PASSWORD API CALLED ===')
    
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
    const validatedData = changePasswordSchema.parse(body)

    // Получаем текущий пользователя
    const { data: user, error: userError2 } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', decoded.userId)
      .single()

    if (userError2 || !user) {
      console.error('Error fetching user:', userError2)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем текущий пароль
    const bcrypt = require('bcryptjs')
    const passwordHash = (user as any)?.password_hash || ''
    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, passwordHash)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Хешируем новый пароль
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // Обновляем пароль
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedNewPassword } as any)
      .eq('id', decoded.userId)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    // Логируем активность
    await logActivity(
      decoded.userId,
      'password_changed',
      { user_role: (currentUser as any)?.role || 'Unknown', details: 'User changed their password' },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully' 
    })

  } catch (error) {
    console.error('Error in POST /api/profile/change-password:', error)
    
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
