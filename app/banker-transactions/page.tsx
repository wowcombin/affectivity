'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface BankerTransaction {
  id: string
  banker_id: string
  ceo_id: string
  amount_usd: number
  amount_currency: string
  sent_date: string
  confirmed_date: string | null
  status: 'pending' | 'confirmed' | 'rejected'
  notes: string | null
  created_at: string
  banker: {
    users: {
      username: string
      full_name: string
    }
  }
  ceo: {
    users: {
      username: string
      full_name: string
    }
  }
}

export default function BankerTransactionsPage() {
  const [transactions, setTransactions] = useState<BankerTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')

  const [showSendForm, setShowSendForm] = useState(false)
  const [showConfirmForm, setShowConfirmForm] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<BankerTransaction | null>(null)
  
  const [sendFormData, setSendFormData] = useState({
    amount_usd: '',
    amount_currency: 'USD',
    ceo_id: '',
    notes: ''
  })
  
  const [confirmFormData, setConfirmFormData] = useState({
    status: 'confirmed',
    notes: ''
  })
  
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
      // Пока используем моковые данные
      const mockTransactions: BankerTransaction[] = [
        {
          id: '1',
          banker_id: '1',
          ceo_id: '2',
          amount_usd: 1500.00,
          amount_currency: 'USD',
          sent_date: new Date().toISOString(),
          confirmed_date: null,
          status: 'pending',
          notes: 'Ежемесячная выплата',
          created_at: new Date().toISOString(),
          banker: { users: { username: 'banker1', full_name: 'John Banker' } },
          ceo: { users: { username: 'ceo1', full_name: 'CEO Manager' } }
        },
        {
          id: '2',
          banker_id: '1',
          ceo_id: '2',
          amount_usd: 2500.00,
          amount_currency: 'EUR',
          sent_date: new Date(Date.now() - 86400000).toISOString(),
          confirmed_date: new Date(Date.now() - 43200000).toISOString(),
          status: 'confirmed',
          notes: 'Бонус за высокие показатели',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          banker: { users: { username: 'banker1', full_name: 'John Banker' } },
          ceo: { users: { username: 'ceo1', full_name: 'CEO Manager' } }
        },
        {
          id: '3',
          banker_id: '3',
          ceo_id: '2',
          amount_usd: 800.00,
          amount_currency: 'GBP',
          sent_date: new Date(Date.now() - 172800000).toISOString(),
          confirmed_date: null,
          status: 'rejected',
          notes: 'Недостаточно средств',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          banker: { users: { username: 'banker2', full_name: 'Sarah Banker' } },
          ceo: { users: { username: 'ceo1', full_name: 'CEO Manager' } }
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

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Здесь будет API для отправки денег
      toast.success('Деньги успешно отправлены!')
      setShowSendForm(false)
      setSendFormData({
        amount_usd: '',
        amount_currency: 'USD',
        ceo_id: '',
        notes: ''
      })
      loadTransactions()
    } catch (error) {
      console.error('Error sending money:', error)
      toast.error('Ошибка отправки денег')
    }
  }

  const handleConfirmTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTransaction) return
    
    try {
      // Здесь будет API для подтверждения транзакции
      toast.success('Транзакция успешно подтверждена!')
      setShowConfirmForm(false)
      setSelectedTransaction(null)
      setConfirmFormData({
        status: 'confirmed',
        notes: ''
      })
      loadTransactions()
    } catch (error) {
      console.error('Error confirming transaction:', error)
      toast.error('Ошибка подтверждения транзакции')
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
      case 'confirmed': return 'from-green-500 to-green-600'
      case 'pending': return 'from-yellow-500 to-orange-500'
      case 'rejected': return 'from-red-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅'
      case 'pending': return '⏳'
      case 'rejected': return '❌'
      default: return '❓'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено'
      case 'pending': return 'Ожидает подтверждения'
      case 'rejected': return 'Отклонено'
      default: return status
    }
  }

  const canSendMoney = ['Admin', 'Manager', 'CFO'].includes(userRole)
  const canConfirmTransactions = ['Admin', 'CEO'].includes(userRole)

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
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Всего отправлено</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(transactions.reduce((sum, t) => sum + t.amount_usd, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Подтверждено</h3>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(transactions.filter(t => t.status === 'confirmed').reduce((sum, t) => sum + t.amount_usd, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Ожидает</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {transactions.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Отклонено</h3>
                <p className="text-3xl font-bold text-red-600">
                  {transactions.filter(t => t.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canSendMoney && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">💸</span>
                  Отправить деньги CEO
                </h3>
                <p className="text-gray-600">Запишите сумму и дату отправки денег</p>
              </div>
              <Button
                onClick={() => setShowSendForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                💸 Отправить деньги
              </Button>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-lg font-bold text-gray-900">📊 Транзакции Банкир → CEO</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👤 Банкир
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👑 CEO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💰 Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📅 Дата отправки
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📅 Дата подтверждения
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📊 Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📝 Заметки
                  </th>
                  {canConfirmTransactions && (
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ⚡ Действия
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-white/20">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              {transaction.banker.users.full_name?.charAt(0) || transaction.banker.users.username.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {transaction.banker.users.full_name || transaction.banker.users.username}
                          </div>
                          <div className="text-sm text-gray-600">
                            @{transaction.banker.users.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              {transaction.ceo.users.full_name?.charAt(0) || transaction.ceo.users.username.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {transaction.ceo.users.full_name || transaction.ceo.users.username}
                          </div>
                          <div className="text-sm text-gray-600">
                            @{transaction.ceo.users.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(transaction.amount_usd)} {transaction.amount_currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      📅 {formatDate(transaction.sent_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.confirmed_date ? (
                        <>📅 {formatDate(transaction.confirmed_date)}</>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getStatusColor(transaction.status)} text-white shadow-lg`}>
                        {getStatusIcon(transaction.status)} {getStatusText(transaction.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.notes || '—'}
                    </td>
                    {canConfirmTransactions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {transaction.status === 'pending' && (
                          <Button
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowConfirmForm(true)
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            ✅ Подтвердить
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Send Money Modal */}
      {showSendForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-md shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md">
            <div className="mt-3">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">💸</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Отправить деньги CEO
                </h3>
                <p className="text-gray-600">Запишите сумму и дату отправки</p>
              </div>
              
              <form onSubmit={handleSendMoney} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Сумма (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sendFormData.amount_usd}
                    onChange={(e) => setSendFormData({...sendFormData, amount_usd: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🌐 Валюта
                  </label>
                  <select
                    value={sendFormData.amount_currency}
                    onChange={(e) => setSendFormData({...sendFormData, amount_currency: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="USD">💵 USD</option>
                    <option value="EUR">💶 EUR</option>
                    <option value="GBP">💷 GBP</option>
                    <option value="USDT">💎 USDT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    👑 CEO (получатель)
                  </label>
                  <select
                    value={sendFormData.ceo_id}
                    onChange={(e) => setSendFormData({...sendFormData, ceo_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Выберите CEO</option>
                    <option value="1">👑 CEO Manager</option>
                    <option value="2">👑 CEO Director</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Заметки
                  </label>
                  <textarea
                    value={sendFormData.notes}
                    onChange={(e) => setSendFormData({...sendFormData, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    rows={3}
                    placeholder="Описание транзакции..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSendForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    💸 Отправить
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Transaction Modal */}
      {showConfirmForm && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-md shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md">
            <div className="mt-3">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Подтвердить получение
                </h3>
                <p className="text-gray-600">
                  Подтвердите получение {formatCurrency(selectedTransaction.amount_usd)} от {selectedTransaction.banker.users.full_name}
                </p>
              </div>
              
              <form onSubmit={handleConfirmTransaction} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📊 Статус
                  </label>
                  <select
                    value={confirmFormData.status}
                    onChange={(e) => setConfirmFormData({...confirmFormData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="confirmed">✅ Подтвердить получение</option>
                    <option value="rejected">❌ Отклонить</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Комментарий
                  </label>
                  <textarea
                    value={confirmFormData.notes}
                    onChange={(e) => setConfirmFormData({...confirmFormData, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    rows={3}
                    placeholder="Комментарий к подтверждению..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowConfirmForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ✅ Подтвердить
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
