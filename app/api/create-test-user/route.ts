import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE TEST USER API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Проверяем, есть ли уже тестовый пользователь
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single()
    
    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test user already exists',
        user: existingUser
      })
    }
    
    // Создаем тестового пользователя
    const hashedPassword = await hashPassword('admin123')
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username: 'admin',
        email: 'admin@example.com',
        full_name: 'Administrator',
        password_hash: hashedPassword,
        role: 'Admin',
        is_active: true
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating test user:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test user created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      },
      credentials: {
        username: 'admin',
        password: 'admin123'
      }
    })
  } catch (error) {
    console.error('Error in create test user:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
}
