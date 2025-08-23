import { NextResponse, type NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export async function middleware(request: NextRequest) {
  // Пропускаем API запросы
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Пропускаем страницу логина
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Проверяем JWT токен из Authorization header или localStorage (через cookie)
  const authHeader = request.headers.get('authorization')
  const authCookie = request.cookies.get('auth-token')?.value
  
  let token = null
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else if (authCookie) {
    token = authCookie
  }

  // Если нет токена, перенаправляем на логин
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!)
    
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Токен валиден, пропускаем запрос
    return NextResponse.next()
    
  } catch (error) {
    // Токен невалиден, перенаправляем на логин
    console.error('JWT verification failed:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
