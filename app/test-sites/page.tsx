'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/app/components/Navigation'

interface User {
  id: string
  username: string
  full_name: string
  role: string
}

export default function TestSitesPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-xl">Загрузка...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Navigation userRole={user.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">🧪</span>
              Тестовые сайты
            </h1>
            <p className="text-gray-600 mt-2">
              Управление тестовыми сайтами и казино (в разработке)
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Страница в разработке</h2>
          <p className="text-gray-600 mb-6">
            Система управления тестовыми сайтами находится в разработке.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Планируемые функции:</h3>
            <ul className="text-green-800 text-left space-y-1">
              <li>• Добавление тестовых сайтов</li>
              <li>• Управление промо-ссылками</li>
              <li>• Отслеживание времени вывода</li>
              <li>• Управление картами и бинами</li>
              <li>• Статусы сайтов</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
