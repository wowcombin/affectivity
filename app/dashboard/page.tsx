'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import JuniorDashboard from '@/app/components/JuniorDashboard'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface DashboardData {
  summary: {
    total_banks: number
    total_cards: number
    total_transactions: number
    total_employees: number
    total_casinos: number
    total_profit: number
  }
  recent_transactions: Array<{
    id: string
    transaction_type: string
    amount: number
    profit: number
    status: string
    transaction_date: string
    cards: {
      card_number: string
      card_type: string
    }
    casinos: {
      name: string
    }
  }>
  card_stats: {
    free: number
    assigned: number
    in_process: number
    completed: number
  }
  transaction_stats: {
    deposits: number
    withdrawals: number
    pending: number
    completed: number
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Получаем роль пользователя
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setUserRole(parsedUser.role)
      
      // Для Employee и Tester показываем специальный дашборд
      if (parsedUser.role === 'Employee' || parsedUser.role === 'Tester') {
        setIsLoading(false)
        return
      }
    }
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      if (!authToken) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      console.log('Dashboard response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        console.error('Failed to load dashboard')
        toast.error('Ошибка загрузки дашборда')
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Ошибка загрузки дашборда')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-green-600'
      case 'pending': return 'from-yellow-500 to-yellow-600'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Navigation userRole={userRole} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка дашборда...</p>
          </div>
        </div>
      </div>
    )
  }

  // Показываем специальный дашборд для Employee и Tester
  if (user && (user.role === 'Employee' || user.role === 'Tester')) {
    return <JuniorDashboard userId={user.id} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navigation userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <span className="mr-3">📊</span>
            Главный дашборд
          </h1>
          <p className="text-blue-200">Обзор всех ключевых метрик и операций</p>
        </div>

        {dashboardData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Банки</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {dashboardData.summary.total_banks}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Карты</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {dashboardData.summary.total_cards}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Транзакции</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {dashboardData.summary.total_transactions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Сотрудники</h3>
                    <p className="text-3xl font-bold text-orange-600">
                      {dashboardData.summary.total_employees}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                    <span className="text-2xl">🎰</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Казино</h3>
                    <p className="text-3xl font-bold text-red-600">
                      {dashboardData.summary.total_casinos}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                    <span className="text-2xl">💵</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Общая прибыль</h3>
                    <p className="text-3xl font-bold text-emerald-600">
                      {formatCurrency(dashboardData.summary.total_profit)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Card Statistics */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💳</span>
                  Статистика карт
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.card_stats.free}</div>
                    <div className="text-sm text-green-600">Свободных</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600">{dashboardData.card_stats.assigned}</div>
                    <div className="text-sm text-blue-600">Назначенных</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-yellow-600">{dashboardData.card_stats.in_process}</div>
                    <div className="text-sm text-yellow-600">В работе</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-purple-600">{dashboardData.card_stats.completed}</div>
                    <div className="text-sm text-purple-600">Завершенных</div>
                  </div>
                </div>
              </div>

              {/* Transaction Statistics */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💰</span>
                  Статистика транзакций
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.transaction_stats.deposits}</div>
                    <div className="text-sm text-green-600">Депозитов</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-red-600">{dashboardData.transaction_stats.withdrawals}</div>
                    <div className="text-sm text-red-600">Выводов</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-yellow-600">{dashboardData.transaction_stats.pending}</div>
                    <div className="text-sm text-yellow-600">В ожидании</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-600">{dashboardData.transaction_stats.completed}</div>
                    <div className="text-sm text-emerald-600">Завершенных</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-green-50 to-blue-50">
                <h2 className="text-lg font-bold text-gray-900">🕒 Последние транзакции</h2>
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
                        💰 Сумма
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        💵 Прибыль
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
                    {dashboardData.recent_transactions.map((transaction) => (
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${
                            transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          } bg-white/70 px-3 py-1 rounded-lg inline-block`}>
                            {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg inline-block">
                            +{formatCurrency(transaction.profit)}
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
                          📅 {formatDate(transaction.transaction_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Нет данных</h3>
            <p className="text-gray-600">Данные дашборда не найдены</p>
          </div>
        )}
      </div>
    </div>
  )
}
