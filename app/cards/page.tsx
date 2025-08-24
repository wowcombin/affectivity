'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Card {
  id: string
  bank_account_id: string
  card_number: string
  expiry_date: string
  cvv: string
  card_type: 'pink' | 'gray'
  status: 'free' | 'assigned' | 'in_process' | 'completed'
  assigned_employee_id: string | null
  assigned_casino_id: string | null
  deposit_amount: number | null
  withdrawal_amount: number | null
  profit: number | null
  created_at: string
  updated_at: string
  bank_accounts: {
    account_name: string
    banks: {
      name: string
    }
  }
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [formData, setFormData] = useState({
    bank_account_id: '',
    card_number: '',
    card_type: 'pink' as 'pink' | 'gray',
    expiry_date: '',
    cvv: '',
    status: 'free' as 'free' | 'assigned' | 'in_process' | 'completed'
  })
  const router = useRouter()

  useEffect(() => {
    // Получаем роль пользователя
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
    }
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      if (!authToken) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/cards', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      console.log('Cards response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards || [])
      } else {
        console.error('Failed to load cards')
        toast.error('Ошибка загрузки карт')
      }
    } catch (error) {
      console.error('Cards error:', error)
      toast.error('Ошибка загрузки карт')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const authToken = localStorage.getItem('auth-token')
      if (!authToken) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Карта успешно добавлена!')
        setShowAddForm(false)
        setFormData({
          bank_account_id: '',
          card_number: '',
          card_type: 'pink',
          expiry_date: '',
          cvv: '',
          status: 'free'
        })
        loadCards()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка добавления карты')
      }
    } catch (error) {
      console.error('Error adding card:', error)
      toast.error('Ошибка добавления карты')
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

  const getFilteredCards = () => {
    let filtered = cards

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.card_type === filterType)
    }

    return filtered
  }

  const getTotalProfit = () => {
    return getFilteredCards().reduce((sum, c) => sum + (c.profit || 0), 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free': return 'from-green-500 to-green-600'
      case 'assigned': return 'from-blue-500 to-blue-600'
      case 'in_process': return 'from-yellow-500 to-yellow-600'
      case 'completed': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'free': return '✅'
      case 'assigned': return '📋'
      case 'in_process': return '⏳'
      case 'completed': return '🎯'
      default: return '❓'
    }
  }

  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'pink': return '🌸'
      case 'gray': return '⚫'
      default: return '💳'
    }
  }

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'pink': return 'from-pink-500 to-pink-600'
      case 'gray': return 'from-gray-500 to-gray-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка карт...</p>
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
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Всего карт</h3>
                <p className="text-3xl font-bold text-blue-600">{cards.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Общая прибыль</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(getTotalProfit())}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Свободных</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {cards.filter(c => c.status === 'free').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">В работе</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {cards.filter(c => c.status === 'in_process').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            Фильтры
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Статус карты
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">Все статусы</option>
                <option value="free">✅ Свободные</option>
                <option value="assigned">📋 Назначенные</option>
                <option value="in_process">⏳ В работе</option>
                <option value="completed">🎯 Завершенные</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Тип карты
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">Все типы</option>
                <option value="pink">🌸 Розовые</option>
                <option value="gray">⚫ Серые</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">💳 Список карт</h2>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                ✨ + Добавить карту
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💳 Карта
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    🏦 Банк
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👤 Назначение
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💰 Прибыль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📊 Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📅 Дата
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-white/20">
                {getFilteredCards().map((card) => (
                  <tr key={card.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-r ${getCardTypeColor(card.card_type)} flex items-center justify-center shadow-lg`}>
                            <span className="text-lg">{getCardTypeIcon(card.card_type)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {card.card_number}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {card.card_type} • {card.expiry_date}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {card.bank_accounts.banks.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {card.bank_accounts.account_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {card.assigned_employee_id ? 'Назначена' : 'Не назначена'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {card.assigned_casino_id ? 'В казино' : 'Свободна'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg inline-block">
                        {card.profit ? formatCurrency(card.profit) : 'Нет данных'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getStatusColor(card.status)} text-white shadow-lg`}>
                        {getStatusIcon(card.status)} {
                          card.status === 'free' ? 'Свободна' :
                          card.status === 'assigned' ? 'Назначена' :
                          card.status === 'in_process' ? 'В работе' :
                          card.status === 'completed' ? 'Завершена' : card.status
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      📅 {formatDate(card.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-md shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md">
            <div className="mt-3">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">💳</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Добавить новую карту
                </h3>
                <p className="text-gray-600">Заполните информацию о карте</p>
              </div>
              
              <form onSubmit={handleAddCard} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💳 Номер карты
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.card_number}
                    onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="**** **** **** ****"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏦 Банковский аккаунт ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bank_account_id}
                    onChange={(e) => setFormData({...formData, bank_account_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="UUID банковского аккаунта"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏷️ Тип карты
                    </label>
                    <select
                      value={formData.card_type}
                      onChange={(e) => setFormData({...formData, card_type: e.target.value as 'pink' | 'gray'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="pink">🌸 Розовая</option>
                      <option value="gray">⚫ Серая</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Срок действия
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="MM/YY"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔒 CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cvv}
                      onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📊 Статус
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'free' | 'assigned' | 'in_process' | 'completed'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="free">✅ Свободна</option>
                      <option value="assigned">📋 Назначена</option>
                      <option value="in_process">⏳ В работе</option>
                      <option value="completed">🎯 Завершена</option>
                    </select>
                  </div>
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
