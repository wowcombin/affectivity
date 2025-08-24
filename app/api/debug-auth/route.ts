// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('DEBUG: /api/debug-auth called')
    
    // Получаем все cookies
    const cookies = request.cookies
    const cookieEntries = []
    for (const [name, value] of cookies.entries()) {
      cookieEntries.push([name, value.value])
    }
    console.log('DEBUG: All cookies:', cookieEntries)
    
    // Получаем токен из cookies
    const authToken = request.cookies.get('auth-token')?.value
    console.log('DEBUG: Auth token present:', !!authToken)
    console.log('DEBUG: Auth token length:', authToken?.length)
    
    if (!authToken) {
      return NextResponse.json({ 
        error: 'No auth token',
        cookies: cookieEntries
      }, { status: 401 })
    }

    // Проверяем JWT секрет
    const hasSecret = !!process.env.SUPABASE_JWT_SECRET
    console.log('DEBUG: Has JWT secret:', hasSecret)

    return NextResponse.json({ 
      success: true,
      hasToken: !!authToken,
      tokenLength: authToken.length,
      hasSecret,
      cookies: cookieEntries
    })
  } catch (error) {
    console.error('DEBUG: Error in debug-auth:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
}
