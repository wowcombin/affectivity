// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/types/database'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Получение текущего пользователя
export async function getCurrentUser() {
  console.log('=== GET CURRENT USER CALLED ===')
  
  try {
    const supabase = createClient()
    console.log('Supabase client created')
    
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('Supabase auth result:', { user: !!user, error })
    
    if (error || !user) {
      console.log('No user from Supabase auth')
      return null
    }

    console.log('Getting user data from database...')
    // Получаем дополнительные данные пользователя из таблицы users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Database user result:', { userData: !!userData, userError })

    if (userError || !userData) {
      console.log('No user data from database')
      return null
    }

    console.log('User found:', userData.username, userData.role)
    return userData
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Проверка авторизации для API
export async function requireAuth(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      throw new Error('No auth token')
    }

    // Верифицируем токен
    const decoded = verifyToken(authToken)
    if (!decoded) {
      throw new Error('Invalid token')
    }

    const supabase = createAdminClient()

    // Получаем данные пользователя
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      throw new Error('User not found')
    }

    return user
  } catch (error) {
    console.error('Auth error:', error)
    throw error
  }
}

// Проверка авторизации для страниц
export async function requireAuthPage() {
  console.log('=== REQUIRE AUTH PAGE CALLED ===')
  
  try {
    const user = await getCurrentUser()
    console.log('Current user result:', { user: !!user, id: user?.id, username: user?.username, role: user?.role })
    
    if (!user) {
      console.log('No user found, redirecting to login')
      redirect('/login')
    }
    
    console.log('User authenticated successfully')
    return user
  } catch (error) {
    console.error('Auth page error:', error)
    throw error
  }
}

// Проверка роли пользователя
export async function requireRole(allowedRoles: UserRole[]) {
  console.log('=== REQUIRE ROLE CALLED ===')
  console.log('Allowed roles:', allowedRoles)
  
  try {
    const user = await requireAuthPage()
    console.log('User authenticated:', { id: user.id, username: user.username, role: user.role })
    
    if (!allowedRoles.includes(user.role as UserRole)) {
      console.log('User role not allowed:', user.role)
      redirect('/unauthorized')
    }
    
    console.log('Role check passed')
    return user
  } catch (error) {
    console.error('Role check error:', error)
    throw error
  }
}

// Проверка конкретной роли
export async function requireAdmin() {
  return requireRole(['Admin'])
}

export async function requireManager() {
  return requireRole(['Admin', 'Manager'])
}

export async function requireHR() {
  console.log('=== REQUIRE HR CALLED ===')
  try {
    const user = await requireRole(['Admin', 'HR'])
    console.log('HR role check passed:', user.username)
    return user
  } catch (error) {
    console.error('HR role check failed:', error)
    throw error
  }
}

export async function requireCFO() {
  return requireRole(['Admin', 'CFO'])
}

// Хеширование пароля
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Проверка пароля
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Генерация JWT токена
export function generateToken(payload: any): string {
  return jwt.sign(payload, process.env.SUPABASE_JWT_SECRET!, { expiresIn: '7d' })
}

// Верификация JWT токена
export function verifyToken(token: string): any {
  try {
    console.log('Verifying token with secret:', !!process.env.SUPABASE_JWT_SECRET)
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!)
    console.log('Token verified successfully:', decoded)
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Проверка прав на увольнение
export function canFireEmployee(firedByRole: UserRole, employeeRole: UserRole): boolean {
  if (firedByRole === 'Admin') {
    return true // Admin может уволить любого
  }
  
  if (firedByRole === 'Manager') {
    return ['Employee', 'Tester'].includes(employeeRole)
  }
  
  return false // HR и CFO не могут увольнять
}

// Валидация BEP20 адреса
export function validateBEP20Address(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }

  // BEP20 адрес должен начинаться с 0x
  if (!address.startsWith('0x')) {
    return false
  }

  // Проверка длины (42 символа включая 0x)
  if (address.length !== 42) {
    return false
  }

  // Проверка что содержит только hex символы после 0x
  const hex = address.slice(2)
  const hexRegex = /^[0-9a-fA-F]{40}$/

  return hexRegex.test(hex)
}

// Генерация временного пароля
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Логирование активности
export async function logActivity(
  userId: string | null,
  action: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) {
  const supabase = createClient()
  
  try {
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        details,
        ip_address: ipAddress,
        user_agent: userAgent
      })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

// Получение IP адреса из запроса
export function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return null
}
