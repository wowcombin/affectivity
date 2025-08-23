import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Форматирование валюты
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Форматирование даты
export function formatDate(date: string | Date, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat('ru-RU', defaultOptions).format(new Date(date))
}

// Форматирование процентов
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Сокращение больших чисел
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Получение цвета статуса
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'success':
      return 'text-green-600 bg-green-100'
    case 'pending':
    case 'waiting':
      return 'text-yellow-600 bg-yellow-100'
    case 'blocked':
    case 'failed':
    case 'cancelled':
      return 'text-red-600 bg-red-100'
    case 'in_use':
      return 'text-blue-600 bg-blue-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// Получение иконки статуса
export function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'success':
      return '✅'
    case 'pending':
    case 'waiting':
      return '⏳'
    case 'blocked':
    case 'failed':
    case 'cancelled':
      return '❌'
    case 'in_use':
      return '🔄'
    default:
      return '❓'
  }
}
