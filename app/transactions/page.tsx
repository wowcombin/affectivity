'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Transaction {
  id: string
  amount_usd: number
  transaction_type: string
  status: string
  casino_id: string
  card_id: string
  employee_id: string
  created_at: string
  casinos: {
    name: string
    url: string
  }
  cards: {
    card_number: string
    card_type: string
  }
  employees: {
    users: {
      username: string
      full_name: string
    }
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const router = useRouter()

  useEffect(() => {
    // Получаем роль пользователя
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
    }
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      // Здесь будет API для загрузки транзакций
      // Пока используем моковые данные
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          amount_usd: 150.00,
          transaction_type: 'deposit',
          status: 'completed',
          casino_id: '1',
          card_id: '1',
          employee_id: '1',
          created_at: new Date().toISOString(),
          casinos: { name: 'Casino Royal', url: 'https://casinoroyal.com' },
          cards: { card_number: '****1234', card_type: 'visa' },
          employees: { users: { username: 'john_doe', full_name: 'John Doe' } }
        },
        {
          id: '2',
          amount_usd: 75.50,
          transaction_type: 'withdrawal',
          status: 'pending',
          casino_id: '2',
          card_id: '2',
          employee_id: '2',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          casinos: { name: 'Lucky Stars', url: 'https://luckystars.com' },
          cards: { card_number: '****5678', card_type: 'mastercard' },
          employees: { users: { username: 'jane_smith', full_name: 'Jane Smith' } }
        },
        {
          id: '3',
          amount_usd: 200.00,
          transaction_type: 'deposit',
          status: 'failed',
          casino_id: '3',
          card_id: '3',
          employee_id: '3',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          casinos: { name: 'Golden Palace', url: 'https://goldenpalace.com' },
          cards: { card_number: '****9012', card_type: 'visa' },
          employees: { users: { username: 'mike_wilson', full_name: 'Mike Wilson' } }
        }
      ]
      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error('Ошибка загрузки транзакций')
    } finally {
      setIsLoading(false)
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

  const getFilteredTransactions = () => {
    let filtered = transactions

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus)
    }

    return filtered
  }

  const getTotalAmount = () => {
    return getFilteredTransactions().reduce((sum, t) => sum + t.amount_usd, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-green-600'
      case 'pending': return 'from-yellow-500 to-orange-500'
      case 'failed': return 'from-red-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'pending': return '⏳'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰'
      case 'withdrawal': return '💸'
      default: return '💳'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка транзакций...</p>
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
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Всего транзакций</h3>
                <p className="text-3xl font-bold text-blue-600">{transactions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Общая сумма</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(getTotalAmount())}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Успешных</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {transactions.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">В ожидании</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {transactions.filter(t => t.status === 'pending').length}
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
                Тип транзакции
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">Все типы</option>
                <option value="deposit">💰 Депозит</option>
                <option value="withdrawal">💸 Вывод</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">Все статусы</option>
                <option value="completed">✅ Завершено</option>
                <option value="pending">⏳ В ожидании</option>
                <option value="failed">❌ Ошибка</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-lg font-bold text-gray-900">📊 Список транзакций</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💳 Транзакция
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    🎰 Казино
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👤 Сотрудник
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💰 Сумма
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
                {getFilteredTransactions().map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <span className="text-lg">{getTypeIcon(transaction.transaction_type)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 capitalize">
                            {transaction.transaction_type === 'deposit' ? 'Депозит' : 'Вывод'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {transaction.cards.card_number} • {transaction.cards.card_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {transaction.casinos.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        <a href={transaction.casinos.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {transaction.casinos.url}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {transaction.employees.users.full_name || transaction.employees.users.username}
                      </div>
                      <div className="text-sm text-gray-600">
                        @{transaction.employees.users.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${
                        transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      } bg-white/70 px-3 py-1 rounded-lg inline-block`}>
                        {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount_usd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getStatusColor(transaction.status)} text-white shadow-lg`}>
                        {getStatusIcon(transaction.status)} {
                          transaction.status === 'completed' ? 'Завершено' :
                          transaction.status === 'pending' ? 'В ожидании' :
                          transaction.status === 'failed' ? 'Ошибка' : transaction.status
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      📅 {formatDate(transaction.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
