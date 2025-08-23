'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Card {
  id: string
  card_number: string
  card_type: string
  expiry_date: string
  cvv: string
  balance_usd: number
  status: string
  casino_id: string
  employee_id: string
  created_at: string
  casinos: {
    name: string
    url: string
  }
  employees: {
    users: {
      username: string
      full_name: string
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
    card_number: '',
    card_type: 'visa',
    expiry_date: '',
    cvv: '',
    balance_usd: '',
    casino_id: '',
    employee_id: ''
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
      // Здесь будет API для загрузки карт
      // Пока используем моковые данные
      const mockCards: Card[] = [
        {
          id: '1',
          card_number: '****1234',
          card_type: 'visa',
          expiry_date: '12/25',
          cvv: '123',
          balance_usd: 1500.00,
          status: 'active',
          casino_id: '1',
          employee_id: '1',
          created_at: new Date().toISOString(),
          casinos: { name: 'Casino Royal', url: 'https://casinoroyal.com' },
          employees: { users: { username: 'john_doe', full_name: 'John Doe' } }
        },
        {
          id: '2',
          card_number: '****5678',
          card_type: 'mastercard',
          expiry_date: '08/26',
          cvv: '456',
          balance_usd: 750.50,
          status: 'active',
          casino_id: '2',
          employee_id: '2',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          casinos: { name: 'Lucky Stars', url: 'https://luckystars.com' },
          employees: { users: { username: 'jane_smith', full_name: 'Jane Smith' } }
        },
        {
          id: '3',
          card_number: '****9012',
          card_type: 'visa',
          expiry_date: '03/24',
          cvv: '789',
          balance_usd: 0.00,
          status: 'expired',
          casino_id: '3',
          employee_id: '3',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          casinos: { name: 'Golden Palace', url: 'https://goldenpalace.com' },
          employees: { users: { username: 'mike_wilson', full_name: 'Mike Wilson' } }
        }
      ]
      setCards(mockCards)
    } catch (error) {
      console.error('Error loading cards:', error)
      toast.error('Ошибка загрузки карт')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Здесь будет API для добавления карты
      toast.success('Карта успешно добавлена!')
      setShowAddForm(false)
      setFormData({
        card_number: '',
        card_type: 'visa',
        expiry_date: '',
        cvv: '',
        balance_usd: '',
        casino_id: '',
        employee_id: ''
      })
      loadCards()
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

  const getTotalBalance = () => {
    return getFilteredCards().reduce((sum, c) => sum + c.balance_usd, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-500 to-green-600'
      case 'inactive': return 'from-gray-500 to-gray-600'
      case 'expired': return 'from-red-500 to-red-600'
      case 'blocked': return 'from-orange-500 to-red-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅'
      case 'inactive': return '⏸️'
      case 'expired': return '❌'
      case 'blocked': return '🚫'
      default: return '❓'
    }
  }

  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'visa': return '💳'
      case 'mastercard': return '💳'
      case 'amex': return '💳'
      default: return '💳'
    }
  }

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'visa': return 'from-blue-500 to-blue-600'
      case 'mastercard': return 'from-red-500 to-orange-500'
      case 'amex': return 'from-green-500 to-green-600'
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
                <h3 className="text-lg font-medium text-gray-900">Общий баланс</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(getTotalBalance())}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Активных</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {cards.filter(c => c.status === 'active').length}
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
                <h3 className="text-lg font-medium text-gray-900">Просроченных</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {cards.filter(c => c.status === 'expired').length}
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
                <option value="active">✅ Активные</option>
                <option value="inactive">⏸️ Неактивные</option>
                <option value="expired">❌ Просроченные</option>
                <option value="blocked">🚫 Заблокированные</option>
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
                <option value="visa">💳 Visa</option>
                <option value="mastercard">💳 Mastercard</option>
                <option value="amex">💳 American Express</option>
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
                    🎰 Казино
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👤 Сотрудник
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💰 Баланс
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
                        {card.casinos.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        <a href={card.casinos.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {card.casinos.url}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {card.employees.users.full_name || card.employees.users.username}
                      </div>
                      <div className="text-sm text-gray-600">
                        @{card.employees.users.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(card.balance_usd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getStatusColor(card.status)} text-white shadow-lg`}>
                        {getStatusIcon(card.status)} {
                          card.status === 'active' ? 'Активна' :
                          card.status === 'inactive' ? 'Неактивна' :
                          card.status === 'expired' ? 'Просрочена' :
                          card.status === 'blocked' ? 'Заблокирована' : card.status
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏷️ Тип карты
                    </label>
                    <select
                      value={formData.card_type}
                      onChange={(e) => setFormData({...formData, card_type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="visa">💳 Visa</option>
                      <option value="mastercard">💳 Mastercard</option>
                      <option value="amex">💳 American Express</option>
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
                      💰 Баланс (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.balance_usd}
                      onChange={(e) => setFormData({...formData, balance_usd: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300"
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
