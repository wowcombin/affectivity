'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import { toast } from 'sonner'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Сохраняем токен в localStorage
        localStorage.setItem('auth-token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        toast.success('Успешный вход в систему!')
        
        // Перенаправляем на главную страницу
        router.push('/')
      } else {
        toast.error(data.error || 'Ошибка входа')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Ошибка подключения к серверу')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Affectivity
          </h1>
          <p className="text-blue-100 text-lg">
            Employee Tracking System 2.0
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              👤 Имя пользователя
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              placeholder="Введите имя пользователя"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              🔒 Пароль
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              placeholder="Введите пароль"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Вход в систему...
              </div>
            ) : (
              '🚀 Войти в систему'
            )}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-sm font-semibold text-white mb-2">🧪 Демо аккаунты:</h3>
          <div className="space-y-2 text-xs text-blue-100">
            <div><strong>Admin:</strong> admin / admin123</div>
            <div><strong>Manager:</strong> manager / manager123</div>
            <div><strong>HR:</strong> hr / hr123</div>
            <div><strong>CFO:</strong> cfo / cfo123</div>
            <div><strong>Employee:</strong> employee / employee123</div>
            <div><strong>Tester:</strong> tester / tester123</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-blue-200">
            © 2024 Affectivity. Все права защищены.
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-white/20 text-6xl animate-bounce">
        💼
      </div>
      <div className="absolute top-20 right-20 text-white/20 text-4xl animate-pulse">
        📊
      </div>
      <div className="absolute bottom-20 left-20 text-white/20 text-5xl animate-bounce animation-delay-1000">
        👥
      </div>
      <div className="absolute bottom-10 right-10 text-white/20 text-3xl animate-pulse animation-delay-2000">
        💰
      </div>
    </div>
  )
}
