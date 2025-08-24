import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Форматирование валюты
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Форматирование даты
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Форматирование даты без времени
export function formatDateOnly(date: string | Date): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

// Форматирование времени
export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Форматирование процентов
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

// Форматирование чисел
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value)
}

// Получение относительного времени
export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'только что'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ч назад`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} дн назад`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} нед назад`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} мес назад`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} лет назад`
}

// Валидация email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Валидация USDT адреса (BEP20)
export function validateBEP20Address(address: string): boolean {
  const bep20Regex = /^0x[a-fA-F0-9]{40}$/
  return bep20Regex.test(address)
}

// Валидация номера карты
export function validateCardNumber(cardNumber: string): boolean {
  const cardRegex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/
  return cardRegex.test(cardNumber)
}

// Маскирование номера карты
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber) return ''
  const cleaned = cardNumber.replace(/\s/g, '')
  if (cleaned.length !== 16) return cardNumber
  
  return `${cleaned.slice(0, 4)} **** **** ${cleaned.slice(-4)}`
}

// Генерация случайного ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Генерация случайного пароля
export function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Получение IP адреса из запроса
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return 'unknown'
}

// Получение User Agent
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

// Логирование действий
export async function logActivity(
  userId: string,
  action: string,
  details: any,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        details,
        ip_address: ipAddress,
        user_agent: userAgent,
      }),
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

// Получение цвета для статуса
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
    case 'active':
      return 'from-green-500 to-green-600'
    case 'pending':
    case 'processing':
      return 'from-yellow-500 to-yellow-600'
    case 'failed':
    case 'error':
    case 'blocked':
      return 'from-red-500 to-red-600'
    case 'free':
    case 'available':
      return 'from-blue-500 to-blue-600'
    case 'assigned':
      return 'from-purple-500 to-purple-600'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

// Получение иконки для статуса
export function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return '✅'
    case 'pending':
    case 'processing':
      return '⏳'
    case 'failed':
    case 'error':
      return '❌'
    case 'active':
      return '🟢'
    case 'blocked':
      return '🚫'
    case 'free':
      return '🆓'
    case 'assigned':
      return '📌'
    default:
      return '❓'
  }
}

// Получение цвета для роли
export function getRoleColor(role: string): string {
  switch (role) {
    case 'Admin':
      return 'from-red-500 to-red-600'
    case 'CFO':
      return 'from-purple-500 to-purple-600'
    case 'Manager':
      return 'from-blue-500 to-blue-600'
    case 'Employee':
      return 'from-green-500 to-green-600'
    case 'Tester':
      return 'from-yellow-500 to-yellow-600'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

// Получение иконки для роли
export function getRoleIcon(role: string): string {
  switch (role) {
    case 'Admin':
      return '👑'
    case 'CFO':
      return '💰'
    case 'Manager':
      return '👔'
    case 'Employee':
      return '👷'
    case 'Tester':
      return '🧪'
    default:
      return '👤'
  }
}

// Получение цвета для типа транзакции
export function getTransactionTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'deposit':
      return 'from-green-500 to-green-600'
    case 'withdrawal':
      return 'from-red-500 to-red-600'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

// Получение иконки для типа транзакции
export function getTransactionTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'deposit':
      return '💰'
    case 'withdrawal':
      return '💸'
    default:
      return '💳'
  }
}

// Получение цвета для типа карты
export function getCardTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'debit':
      return 'from-blue-500 to-blue-600'
    case 'credit':
      return 'from-purple-500 to-purple-600'
    case 'prepaid':
      return 'from-orange-500 to-orange-600'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

// Получение иконки для типа карты
export function getCardTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'debit':
      return '💳'
    case 'credit':
      return '💳'
    case 'prepaid':
      return '💳'
    default:
      return '💳'
  }
}

// Форматирование размера файла
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Форматирование длительности
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м ${secs}с`
  } else if (minutes > 0) {
    return `${minutes}м ${secs}с`
  } else {
    return `${secs}с`
  }
}

// Получение начальной буквы имени
export function getInitials(name: string): string {
  if (!name) return '?'
  
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  
  return name[0].toUpperCase()
}

// Генерация градиента на основе строки
export function generateGradientFromString(str: string): string {
  const colors = [
    'from-red-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-orange-500',
    'from-green-500 to-teal-500',
    'from-blue-500 to-indigo-500',
    'from-purple-500 to-pink-500',
    'from-pink-500 to-rose-500',
  ]
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

// Проверка, является ли объект пустым
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

// Глубокое клонирование объекта
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (typeof obj === 'object') {
    const clonedObj = {} as any
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

// Дебаунс функция
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Троттлинг функция
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Безопасное получение значения из объекта
export function get(obj: any, path: string, defaultValue: any = undefined): any {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }
  
  return result !== undefined ? result : defaultValue
}

// Установка значения в объект по пути
export function set(obj: any, path: string, value: any): any {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current = obj
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[lastKey] = value
  return obj
}
