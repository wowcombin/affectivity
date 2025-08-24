// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== UPDATE PASSWORD API CALLED ===')
    console.log('User ID:', params.id)
    
    const body = await request.json()
    const { password } = body
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }
    
    const supabase = createAdminClient()
    
    // Хешируем новый пароль
    const hashedPassword = await hashPassword(password)
    console.log('Password hashed successfully')
    
    // Обновляем пароль в базе данных
    const { data: user, error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating password:', error)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }
    
    console.log('Password updated successfully for user:', user.username)
    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
    
  } catch (error) {
    console.error('UPDATE PASSWORD ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
