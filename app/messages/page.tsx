'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/app/components/Navigation'
import { toast } from 'sonner'

interface User {
  id: string
  username: string
  full_name: string
  role: string
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth-token')
        const userData = localStorage.getItem('user')
        
        if (!token || !userData) {
          router.push('/login')
          return
        }

        const user = JSON.parse(userData)
        setUser(user)

        // Проверяем права доступа
        if (!['Admin', 'CFO'].includes(user.role)) {
          toast.error('Недостаточно прав для доступа к этой странице')
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole={user.role} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">💬 Сообщения</h1>
          </div>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Страница в разработке</h2>
            <p className="text-gray-500">Функционал управления сообщениями будет добавлен в ближайшее время</p>
          </div>
        </div>
      </div>
    </div>
  )
}
