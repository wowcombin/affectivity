'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface ReportData {
  summary?: {
    banks: number
    cards: number
    transactions: number
  }
  transactions?: Array<{
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
  cards?: Array<{
    id: string
    card_number: string
    card_type: string
    status: string
    bank_accounts: {
      account_name: string
      banks: {
        name: string
      }
    }
  }>
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState('summary')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [userRole, setUserRole] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Получаем роль пользователя
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
    }
  }, [])

  useEffect(() => {
    loadReport()
  }, [reportType, startDate, endDate])

  const loadReport = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      if (!authToken) {
        router.push('/login')
        return
      }

      let url = `/api/reports?type=${reportType}`
      if (startDate) url += `&startDate=${startDate}`
      if (endDate) url += `&endDate=${endDate}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      console.log('Reports response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setReportData(data.report || {})
      } else {
        console.error('Failed to load report')
        toast.error('Ошибка загрузки отчета')
      }
    } catch (error) {
      console.error('Reports error:', error)
      toast.error('Ошибка загрузки отчета')
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

  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'pink': return '🩷'
      case 'gray': return '⚫'
      default: return '💳'
    }
  }

  const getCardStatusColor = (status: string) => {
    switch (status) {
      case 'free': return 'from-green-500 to-green-600'
      case 'assigned': return 'from-blue-500 to-blue-600'
      case 'in_process': return 'from-yellow-500 to-yellow-600'
      case 'completed': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getCardStatusIcon = (status: string) => {
    switch (status) {
      case 'free': return '🆓'
      case 'assigned': return '📋'
      case 'in_process': return '⚡'
      case 'completed': return '✅'
      default: return '❓'
    }
  }

  const exportReport = () => {
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Отчет экспортирован')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navigation userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <span className="mr-3">📊</span>
            Отчеты и аналитика
          </h1>
          <p className="text-blue-200">Детальная аналитика по всем операциям</p>
        </div>

        {/* Report Controls */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            Настройки отчета
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Тип отчета
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="summary">📈 Общая статистика</option>
                <option value="transactions">💰 Транзакции</option>
                <option value="cards">💳 Карты</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Дата начала
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Дата окончания
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={exportReport} className="w-full">
                📥 Экспорт
              </Button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка отчета...</p>
          </div>
        )}

        {/* Summary Report */}
        {!isLoading && reportType === 'summary' && reportData.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <span className="text-2xl">🏦</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Банки</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {reportData.summary.banks}
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
                    {reportData.summary.cards}
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
                    {reportData.summary.transactions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Report */}
        {!isLoading && reportType === 'transactions' && reportData.transactions && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-green-50 to-blue-50">
              <h2 className="text-lg font-bold text-gray-900">💰 Отчет по транзакциям</h2>
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
                  {reportData.transactions.map((transaction) => (
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
        )}

        {/* Cards Report */}
        {!isLoading && reportType === 'cards' && reportData.cards && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-lg font-bold text-gray-900">💳 Отчет по картам</h2>
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
                      📊 Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-white/20">
                  {reportData.cards.map((card) => (
                    <tr key={card.id} className="hover:bg-white/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                              <span className="text-lg">{getCardTypeIcon(card.card_type)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">
                              {card.card_number}
                            </div>
                            <div className="text-sm text-gray-600 capitalize">
                              {card.card_type === 'pink' ? 'Розовая' : 'Серая'}
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
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getCardStatusColor(card.status)} text-white shadow-lg`}>
                          {getCardStatusIcon(card.status)} {
                            card.status === 'free' ? 'Свободна' :
                            card.status === 'assigned' ? 'Назначена' :
                            card.status === 'in_process' ? 'В работе' :
                            card.status === 'completed' ? 'Завершена' : card.status
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data */}
        {!isLoading && (!reportData.summary && !reportData.transactions && !reportData.cards) && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Нет данных</h3>
            <p className="text-gray-600">Для выбранного типа отчета и периода данных не найдено</p>
          </div>
        )}
      </div>
    </div>
  )
}
