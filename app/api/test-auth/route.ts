// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      }
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 401 })
  }
}
