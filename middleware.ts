import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Пропускаем API запросы
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Пропускаем страницу логина и auth
  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Пропускаем статические файлы
  if (request.nextUrl.pathname.startsWith('/_next/') || request.nextUrl.pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Проверяем JWT токен из cookie
  const authCookie = request.cookies.get('auth-token')?.value
  
  console.log('Middleware - Path:', request.nextUrl.pathname)
  console.log('Middleware - Auth cookie:', authCookie ? 'Present' : 'Not found')

  // Если нет токена, перенаправляем на логин
  if (!authCookie) {
    console.log('Middleware - No token, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Токен есть, пропускаем запрос
  console.log('Middleware - Token found, allowing access')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
