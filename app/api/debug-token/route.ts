// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG TOKEN API CALLED ===')
    
    // Получаем все заголовки
    const headers = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log('All headers:', headers)
    
    // Получаем токен из cookies
    const cookieToken = request.cookies.get('auth-token')?.value
    console.log('Cookie token:', cookieToken ? 'Present' : 'Not found')
    
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization')
    console.log('Authorization header:', authHeader)
    
    let headerToken = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      headerToken = authHeader.substring(7)
      console.log('Header token:', headerToken ? 'Present' : 'Not found')
    }
    
    // Проверяем JWT секрет
    const hasSecret = !!process.env.SUPABASE_JWT_SECRET
    console.log('Has JWT secret:', hasSecret)
    
    return NextResponse.json({ 
      success: true,
      cookieToken: !!cookieToken,
      headerToken: !!headerToken,
      hasSecret,
      headers: Object.keys(headers),
      authHeader: authHeader ? 'Present' : 'Not found'
    })
  } catch (error) {
    console.error('DEBUG TOKEN ERROR:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
}
