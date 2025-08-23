'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface WorkFile {
  id: string
  employee_id: string
  month: string
  casino_name: string
  deposit_amount: number
  withdrawal_amount: number
  card_number: string
  card_expiry: string
  card_cvv: string
  account_username: string
  account_password: string
  card_type: 'pink' | 'gray'
  bank_name: string
  withdrawal_status: 'new' | 'sent' | 'received' | 'problem' | 'blocked'
  withdrawal_question: string | null
  is_draft: boolean
  created_at: string
  updated_at: string
}

interface User {
  id: string
  username: string
  full_name: string
  role: string
}

export default function WorkFilesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [workFiles, setWorkFiles] = useState<WorkFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const router = useRouter()

  const [formData, setFormData] = useState({
    month: '',
    casino_name: '',
    deposit_amount: '',
    withdrawal_amount: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    account_username: '',
    account_password: '',
    card_type: 'gray' as 'pink' | 'gray',
    bank_name: '',
    withdrawal_question: '',
    is_draft: false
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          loadWorkFiles()
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

  const loadWorkFiles = async () => {
    try {
      // Сначала тестируем аутентификацию
      const authTestRes = await fetch('/api/test-auth')
      console.log('Auth test response:', authTestRes.status)
      
      if (!authTestRes.ok) {
        const authError = await authTestRes.json()
        console.error('Auth error:', authError)
        toast.error('Ошибка аутентификации: ' + authError.error)
        return
      }

      const response = await fetch('/api/work-files')
      console.log('Work files response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setWorkFiles(data.workFiles)
      } else {
        const error = await response.json()
        console.error('Work files error:', error)
        toast.error('Ошибка загрузки рабочих файлов: ' + error.error)
      }
    } catch (error) {
      console.error('Error loading work files:', error)
      toast.error('Ошибка загрузки рабочих файлов: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/work-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Запись успешно добавлена!')
        setShowAddForm(false)
        setFormData({
          month: '',
          casino_name: '',
          deposit_amount: '',
          withdrawal_amount: '',
          card_number: '',
          card_expiry: '',
          card_cvv: '',
          account_username: '',
          account_password: '',
          card_type: 'gray',
          bank_name: '',
          withdrawal_question: '',
          is_draft: false
        })
        loadWorkFiles()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка добавления записи')
      }
    } catch (error) {
      console.error('Error adding work file:', error)
      toast.error('Ошибка добавления записи')
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/work-files/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success('Статус обновлен!')
        loadWorkFiles()
      } else {
        toast.error('Ошибка обновления статуса')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Ошибка обновления статуса')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-yellow-100 text-yellow-800'
      case 'received': return 'bg-green-100 text-green-800'
      case 'problem': return 'bg-red-100 text-red-800'
      case 'blocked': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новый'
      case 'sent': return 'Отправлен'
      case 'received': return 'Получен'
      case 'problem': return 'Проблема'
      case 'blocked': return 'Заблокирован'
      default: return status
    }
  }

  const getFilteredWorkFiles = () => {
    let filtered = workFiles

    if (selectedMonth) {
      filtered = filtered.filter(file => file.month === selectedMonth)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(file => file.withdrawal_status === filterStatus)
    }

    return filtered
  }

  const getStats = () => {
    const filtered = getFilteredWorkFiles()
    const total = filtered.length
    const newCount = filtered.filter(f => f.withdrawal_status === 'new').length
    const sentCount = filtered.filter(f => f.withdrawal_status === 'sent').length
    const receivedCount = filtered.filter(f => f.withdrawal_status === 'received').length
    const problemCount = filtered.filter(f => f.withdrawal_status === 'problem').length
    const blockedCount = filtered.filter(f => f.withdrawal_status === 'blocked').length
    const totalProfit = filtered
      .filter(f => f.withdrawal_status === 'received')
      .reduce((sum, f) => sum + (f.withdrawal_amount - f.deposit_amount), 0)

    return { total, newCount, sentCount, receivedCount, problemCount, blockedCount, totalProfit }
  }

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-xl">Загрузка...</div>
    </div>
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Navigation userRole={user.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">📋</span>
              Рабочие файлы
            </h1>
            <p className="text-gray-600 mt-2">
              Управление рабочими записями и отслеживание статусов выводов
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="mr-2">➕</span>
            Добавить запись
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Всего записей</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Общая прибыль</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalProfit)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-xl">⏳</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">В ожидании</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newCount + stats.sentCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-xl">⚠️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Проблемы</p>
                <p className="text-2xl font-bold text-gray-900">{stats.problemCount + stats.blockedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Месяц</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Все месяцы</option>
                <option value="2025-01">Январь 2025</option>
                <option value="2025-02">Февраль 2025</option>
                <option value="2025-03">Март 2025</option>
                <option value="2025-04">Апрель 2025</option>
                <option value="2025-05">Май 2025</option>
                <option value="2025-06">Июнь 2025</option>
                <option value="2025-07">Июль 2025</option>
                <option value="2025-08">Август 2025</option>
                <option value="2025-09">Сентябрь 2025</option>
                <option value="2025-10">Октябрь 2025</option>
                <option value="2025-11">Ноябрь 2025</option>
                <option value="2025-12">Декабрь 2025</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">Все статусы</option>
                <option value="new">Новый</option>
                <option value="sent">Отправлен</option>
                <option value="received">Получен</option>
                <option value="problem">Проблема</option>
                <option value="blocked">Заблокирован</option>
              </select>
            </div>
          </div>
        </div>

        {/* Work Files Table */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Список записей</h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка записей...</p>
            </div>
          ) : getFilteredWorkFiles().length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Записи не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Казино</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Депозит</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вывод</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Карта</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Банк</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredWorkFiles().map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{file.casino_name}</div>
                          <div className="text-sm text-gray-500">{file.account_username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(file.deposit_amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(file.withdrawal_amount)}</div>
                        <div className="text-sm text-green-600">
                          +{formatCurrency(file.withdrawal_amount - file.deposit_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">****{file.card_number.slice(-4)}</div>
                          <div className="text-sm text-gray-500">
                            {file.card_type === 'pink' ? '🩷 Розовая' : '⚫ Серая'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{file.bank_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(file.withdrawal_status)}`}>
                          {getStatusText(file.withdrawal_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <select
                            value={file.withdrawal_status}
                            onChange={(e) => updateStatus(file.id, e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="new">Новый</option>
                            <option value="sent">Отправлен</option>
                            <option value="received">Получен</option>
                            <option value="problem">Проблема</option>
                            <option value="blocked">Заблокирован</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Добавить запись</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Месяц *</label>
                    <select
                      required
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Выберите месяц</option>
                      <option value="2025-01">Январь 2025</option>
                      <option value="2025-02">Февраль 2025</option>
                      <option value="2025-03">Март 2025</option>
                      <option value="2025-04">Апрель 2025</option>
                      <option value="2025-05">Май 2025</option>
                      <option value="2025-06">Июнь 2025</option>
                      <option value="2025-07">Июль 2025</option>
                      <option value="2025-08">Август 2025</option>
                      <option value="2025-09">Сентябрь 2025</option>
                      <option value="2025-10">Октябрь 2025</option>
                      <option value="2025-11">Ноябрь 2025</option>
                      <option value="2025-12">Декабрь 2025</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Казино *</label>
                    <input
                      type="text"
                      required
                      value={formData.casino_name}
                      onChange={(e) => setFormData({...formData, casino_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Название казино"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Депозит *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Вывод *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.withdrawal_amount}
                      onChange={(e) => setFormData({...formData, withdrawal_amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Номер карты *</label>
                    <input
                      type="text"
                      required
                      value={formData.card_number}
                      onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Срок действия *</label>
                    <input
                      type="text"
                      required
                      value={formData.card_expiry}
                      onChange={(e) => setFormData({...formData, card_expiry: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                    <input
                      type="text"
                      required
                      value={formData.card_cvv}
                      onChange={(e) => setFormData({...formData, card_cvv: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Логин аккаунта *</label>
                    <input
                      type="text"
                      required
                      value={formData.account_username}
                      onChange={(e) => setFormData({...formData, account_username: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Пароль аккаунта *</label>
                    <input
                      type="password"
                      required
                      value={formData.account_password}
                      onChange={(e) => setFormData({...formData, account_password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Тип карты *</label>
                    <select
                      required
                      value={formData.card_type}
                      onChange={(e) => setFormData({...formData, card_type: e.target.value as 'pink' | 'gray'})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="gray">⚫ Серая</option>
                      <option value="pink">🩷 Розовая</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Банк *</label>
                    <input
                      type="text"
                      required
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Название банка"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Вопрос по выводу</label>
                  <textarea
                    value={formData.withdrawal_question}
                    onChange={(e) => setFormData({...formData, withdrawal_question: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    rows={3}
                    placeholder="Опишите проблему с выводом..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_draft"
                    checked={formData.is_draft}
                    onChange={(e) => setFormData({...formData, is_draft: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_draft" className="ml-2 block text-sm text-gray-900">
                    Сохранить как черновик
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Добавить запись
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
