// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/types/database'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Получение текущего пользователя
export async function getCurrentUser() {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Получаем дополнительные данные пользователя из таблицы users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return null
    }

    return userData
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Проверка авторизации
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

// Проверка роли пользователя
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect('/unauthorized')
  }
  
  return user
}

// Проверка конкретной роли
export async function requireAdmin() {
  return requireRole(['Admin'])
}

export async function requireManager() {
  return requireRole(['Admin', 'Manager'])
}

export async function requireHR() {
  return requireRole(['Admin', 'HR'])
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
    return jwt.verify(token, process.env.SUPABASE_JWT_SECRET!)
  } catch (error) {
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
