'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface User {
  id: string
  username: string
  full_name: string | null
  email: string
  role: string
  usdt_address: string | null
  usdt_network: string | null
  created_at: string
  last_login: string | null
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [formData, setFormData] = useState({
    usdt_address: '',
    usdt_network: 'BEP20'
  })
  const router = useRouter()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setUser(user)
        setUserRole(user.role)
        setFormData({
          usdt_address: user.usdt_address || '',
          usdt_network: user.usdt_network || 'BEP20'
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      toast.error('Ошибка загрузки профиля')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUSDT = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/profile/usdt-address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(prev => prev ? { ...prev, ...data.user } : null)
        
        // Обновляем данные в localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          localStorage.setItem('user', JSON.stringify({ ...user, ...data.user }))
        }
        
        toast.success('USDT адрес успешно обновлен!')
        setIsEditing(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка обновления USDT адреса')
      }
    } catch (error) {
      console.error('Error updating USDT address:', error)
      toast.error('Ошибка обновления USDT адреса')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user')
      
      // Очищаем cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      router.push('/login')
      toast.success('Вы успешно вышли из системы')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Ошибка при выходе из системы')
    }
  }

  const validateBEP20Address = (address: string) => {
    // Простая валидация BEP20 адреса (0x + 40 символов hex)
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Пользователь не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation userRole={userRole} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                  <span className="text-4xl font-bold">
                    {user.full_name?.charAt(0) || user.username.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {user.full_name || user.username}
                  </h2>
                  <p className="text-indigo-100 text-lg">
                    @{user.username} • {user.email}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-white/20 backdrop-blur-sm">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-6xl">👤</div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Личная информация
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                  <span className="text-sm font-semibold text-gray-700">👤 Имя пользователя</span>
                  <span className="text-sm font-bold text-gray-900">@{user.username}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                  <span className="text-sm font-semibold text-gray-700">📝 Полное имя</span>
                  <span className="text-sm font-bold text-gray-900">{user.full_name || 'Не указано'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                  <span className="text-sm font-semibold text-gray-700">📧 Email</span>
                  <span className="text-sm font-bold text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                  <span className="text-sm font-semibold text-gray-700">🏷️ Роль</span>
                  <span className="text-sm font-bold text-purple-600">{user.role}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                  <span className="text-sm font-semibold text-gray-700">📅 Дата регистрации</span>
                  <span className="text-sm font-bold text-gray-900">{formatDate(user.created_at)}</span>
                </div>
                {user.last_login && (
                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                    <span className="text-sm font-semibold text-gray-700">🕒 Последний вход</span>
                    <span className="text-sm font-bold text-gray-900">{formatDate(user.last_login)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* USDT Address */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💰</span>
                USDT Адрес для выплат
              </h3>
              
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">🌐 Сеть</span>
                      <span className="text-sm font-bold text-green-600">{user.usdt_network || 'BEP20'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">📍 Адрес</span>
                      <span className="text-sm font-bold text-gray-900 font-mono">
                        {user.usdt_address ? (
                          <span className="bg-white/70 px-2 py-1 rounded-lg">
                            {user.usdt_address.slice(0, 10)}...{user.usdt_address.slice(-8)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Не указан</span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ✏️ Редактировать адрес
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUpdateUSDT} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🌐 Сеть
                    </label>
                    <select
                      value={formData.usdt_network}
                      onChange={(e) => setFormData({...formData, usdt_network: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="BEP20">BEP20 (Binance Smart Chain)</option>
                      <option value="ERC20">ERC20 (Ethereum)</option>
                      <option value="TRC20">TRC20 (Tron)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📍 USDT Адрес
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.usdt_address}
                      onChange={(e) => setFormData({...formData, usdt_address: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-mono"
                      placeholder="0x..."
                    />
                    {formData.usdt_address && !validateBEP20Address(formData.usdt_address) && (
                      <p className="text-red-500 text-xs mt-1">⚠️ Неверный формат адреса</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                                                <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                            >
                              ❌ Отмена
                            </Button>
                    <Button 
                      type="submit"
                      disabled={!validateBEP20Address(formData.usdt_address)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      ✅ Сохранить
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Мой заработок</h3>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(238.46)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Транзакции</h3>
                  <p className="text-3xl font-bold text-green-600">156</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <span className="text-2xl">🎁</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Бонусы</h3>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(200)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
