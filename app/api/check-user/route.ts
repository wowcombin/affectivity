// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== CHECK USER API CALLED ===')
    
    const user = await getCurrentUser()
    console.log('Current user result:', { user: !!user, id: user?.id, username: user?.username, role: user?.role })
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No authenticated user',
        authenticated: false
      }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      }
    })
  } catch (error) {
    console.error('CHECK USER ERROR:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message,
      authenticated: false
    }, { status: 500 })
  }
}
