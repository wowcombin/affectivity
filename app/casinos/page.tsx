'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Casino {
  id: string
  name: string
  url: string
  commission_rate: number | null
  is_active: boolean
  created_at: string
}

export default function CasinosPage() {
  const [casinos, setCasinos] = useState<Casino[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    commission_rate: 0
  })
  const router = useRouter()

  useEffect(() => {
    // Получаем роль пользователя
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
    }
    loadCasinos()
  }, [])

  const loadCasinos = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      if (!authToken) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/casinos', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      console.log('Casinos response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setCasinos(data.casinos || [])
      } else {
        console.error('Failed to load casinos')
        toast.error('Ошибка загрузки казино')
      }
    } catch (error) {
      console.error('Casinos error:', error)
      toast.error('Ошибка загрузки казино')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCasino = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const authToken = localStorage.getItem('auth-token')
      if (!authToken) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/casinos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Казино успешно добавлено!')
        setShowAddForm(false)
        setFormData({
          name: '',
          url: '',
          commission_rate: 0
        })
        loadCasinos()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Ошибка добавления казино')
      }
    } catch (error) {
      console.error('Error adding casino:', error)
      toast.error('Ошибка добавления казино')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-500 to-green-600'
      case 'inactive': return 'from-gray-500 to-gray-600'
      case 'suspended': return 'from-red-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅'
      case 'inactive': return '⏸️'
      case 'suspended': return '🚫'
      default: return '❓'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка казино...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation userRole={userRole} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">🎰</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Всего казино</h3>
                <p className="text-3xl font-bold text-blue-600">{casinos.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Активных</h3>
                <p className="text-3xl font-bold text-green-600">
                  {casinos.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">⏸️</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Неактивных</h3>
                <p className="text-3xl font-bold text-gray-600">
                  {casinos.filter(c => c.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">🚫</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Заблокированных</h3>
                <p className="text-3xl font-bold text-red-600">
                  {casinos.filter(c => !c.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Casinos List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">🎰 Список казино</h2>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                ✨ + Добавить казино
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    🎰 Казино
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    🌐 URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📊 Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💰 Комиссия
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📅 Дата
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-white/20">
                {casinos.map((casino) => (
                  <tr key={casino.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <span className="text-lg">🎰</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {casino.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {casino.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={casino.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-lg inline-block"
                      >
                        🌐 {casino.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getStatusColor(casino.is_active ? 'active' : 'inactive')} text-white shadow-lg`}>
                        {getStatusIcon(casino.is_active ? 'active' : 'inactive')} {
                          casino.is_active ? 'Активно' : 'Неактивно'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {casino.commission_rate ? `${casino.commission_rate}%` : 'Не указана'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Комиссия
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      📅 {formatDate(casino.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Casino Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-md shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md">
            <div className="mt-3">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">🎰</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Добавить новое казино
                </h3>
                <p className="text-gray-600">Заполните информацию о казино</p>
              </div>
              
              <form onSubmit={handleAddCasino} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎰 Название казино
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Введите название казино"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🌐 URL казино
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Комиссия (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ✨ Добавить
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
