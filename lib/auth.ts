import { UserRole } from '@/types/database'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Получение текущего пользователя (устаревшая функция, используйте requireAuth)
export async function getCurrentUser() {
  console.log('=== GET CURRENT USER CALLED (DEPRECATED) ===')
  console.log('⚠️ Эта функция устарела. Используйте requireAuth для API или проверку токена в клиенте.')
  return null
}

// Проверка авторизации для API
export async function requireAuth(request: NextRequest) {
  try {
    // Получаем токен из cookies или заголовка Authorization
    let authToken = request.cookies.get('auth-token')?.value
    
    if (!authToken) {
      // Пробуем получить из заголовка Authorization
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7)
      }
    }

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

// Проверка авторизации для страниц (устаревшая функция)
export async function requireAuthPage() {
  console.log('=== REQUIRE AUTH PAGE CALLED (DEPRECATED) ===')
  console.log('⚠️ Эта функция устарела. Используйте проверку токена в клиенте.')
  redirect('/login')
}

// Проверка роли пользователя (устаревшие функции)
export async function requireRole(allowedRoles: UserRole[]) {
  console.log('=== REQUIRE ROLE CALLED (DEPRECATED) ===')
  console.log('⚠️ Эта функция устарела. Используйте проверку ролей в API.')
  redirect('/login')
}

// Проверка конкретной роли (устаревшие функции)
export async function requireAdmin() {
  return requireRole(['Admin'])
}

export async function requireManager() {
  return requireRole(['Admin', 'Manager'])
}

export async function requireHR() {
  return requireRole(['Admin'])
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
  console.log('=== GENERATE TOKEN CALLED ===')
  console.log('Payload:', payload)
  console.log('JWT Secret present:', !!process.env.SUPABASE_JWT_SECRET)
  
  if (!process.env.SUPABASE_JWT_SECRET) {
    throw new Error('SUPABASE_JWT_SECRET is not configured')
  }
  
  const token = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET, { expiresIn: '7d' })
  console.log('Token generated successfully')
  return token
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
  const supabase = createAdminClient()
  
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
