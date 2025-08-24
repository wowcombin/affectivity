'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const authToken = localStorage.getItem('auth-token')
    const userData = localStorage.getItem('user')
    
    if (authToken && userData) {
      // Если пользователь авторизован, перенаправляем на дашборд
      router.push('/dashboard')
    } else {
      // Если не авторизован, перенаправляем на страницу входа
      router.push('/login')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Перенаправление...</p>
      </div>
    </div>
  )
}
