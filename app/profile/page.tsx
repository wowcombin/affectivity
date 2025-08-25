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
  email: string
  full_name: string
  role: string
  usdt_address: string | null
  usdt_network: string
  created_at: string
  last_login: string | null
}

interface EarningsHistory {
  id: string
  month: string
  total_earnings: number
  transactions_count: number
  average_per_transaction: number
  status: 'paid' | 'pending' | 'processing'
  paid_at: string | null
}

interface TopAccount {
  id: string
  username: string
  full_name: string
  total_earnings: number
  transactions_count: number
  last_activity: string
}

interface MonthlyStats {
  month: string
  total_earnings: number
  transactions_count: number
  average_per_transaction: number
  top_earner: string
  top_earner_amount: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [earningsHistory, setEarningsHistory] = useState<EarningsHistory[]>([])
  const [topAccounts, setTopAccounts] = useState<TopAccount[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showUSDTModal, setShowUSDTModal] = useState(false)
  const [showEarningsModal, setShowEarningsModal] = useState(false)
  const router = useRouter()

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [usdtForm, setUsdtForm] = useState({
    usdt_address: '',
    usdt_network: 'BEP20'
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth-token')
        const userData = localStorage.getItem('user')
        
        if (!token || !userData) {
          router.push('/login')
          return
        }

        const user = JSON.parse(userData)
        setUser(user)
        loadUserData()
        loadEarningsHistory()
        loadTopAccounts()
        loadMonthlyStats()
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadEarningsHistory = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/profile/earnings-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEarningsHistory(data.earnings || [])
      }
    } catch (error) {
      console.error('Error loading earnings history:', error)
    }
  }

  const loadTopAccounts = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/profile/top-accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTopAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error('Error loading top accounts:', error)
    }
  }

  const loadMonthlyStats = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/profile/monthly-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMonthlyStats(data.stats || [])
      }
    } catch (error) {
      console.error('Error loading monthly stats:', error)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Новый пароль должен содержать минимум 6 символов')
      return
    }

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        toast.success('Пароль успешно изменен')
        setShowPasswordModal(false)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ошибка изменения пароля')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Ошибка изменения пароля')
    }
  }

  const handleUSDTUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/profile/update-usdt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usdtForm)
      })

      if (response.ok) {
        toast.success('USDT реквизиты обновлены')
        setShowUSDTModal(false)
        loadUserData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ошибка обновления реквизитов')
      }
    } catch (error) {
      console.error('Error updating USDT:', error)
      toast.error('Ошибка обновления реквизитов')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Пользователь не найден</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navigation userRole={user.role} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">👤 Профиль пользователя</h1>
          <p className="text-blue-200">Управление настройками и просмотр статистики</p>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'profile', name: 'Профиль', icon: '👤' },
              { id: 'earnings', name: 'История заработка', icon: '💰' },
              { id: 'stats', name: 'Статистика', icon: '📊' },
              { id: 'top', name: 'Топ аккаунты', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">📋 Информация о пользователе</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/20">
                  <span className="text-gray-300">Имя пользователя:</span>
                  <span className="text-white font-semibold">{user.username}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-white/20">
                  <span className="text-gray-300">Email:</span>
                  <span className="text-white font-semibold">{user.email}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-white/20">
                  <span className="text-gray-300">Полное имя:</span>
                  <span className="text-white font-semibold">{user.full_name || 'Не указано'}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-white/20">
                  <span className="text-gray-300">Роль:</span>
                  <span className="text-white font-semibold">{user.role}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-white/20">
                  <span className="text-gray-300">Дата регистрации:</span>
                  <span className="text-white font-semibold">{formatDate(user.created_at)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-300">Последний вход:</span>
                  <span className="text-white font-semibold">
                    {user.last_login ? formatDate(user.last_login) : 'Никогда'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">⚙️ Действия</h2>
              
              <div className="space-y-4">
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🔐 Изменить пароль
                </Button>
                
                <Button
                  onClick={() => setShowUSDTModal(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  💰 Обновить USDT реквизиты
                </Button>
                
                <Button
                  onClick={() => setShowEarningsModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  📊 Детальная статистика
                </Button>
                
                <Button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🚪 Выйти из аккаунта
                </Button>
              </div>

              {/* USDT Info */}
              {user.usdt_address && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-3">💳 USDT Реквизиты</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Адрес:</span>
                      <span className="text-white font-mono text-sm">{user.usdt_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Сеть:</span>
                      <span className="text-white font-semibold">{user.usdt_network}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Earnings History Tab */}
        {activeTab === 'earnings' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">💰 История заработка</h2>
            
            {earningsHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300">История заработка пока пуста</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Месяц</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Общий заработок</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Транзакций</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Среднее</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Статус</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Дата выплаты</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsHistory.map((earning) => (
                      <tr key={earning.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-4 text-white">{earning.month}</td>
                        <td className="py-3 px-4 text-white font-semibold">{formatCurrency(earning.total_earnings)}</td>
                        <td className="py-3 px-4 text-white">{earning.transactions_count}</td>
                        <td className="py-3 px-4 text-white">{formatCurrency(earning.average_per_transaction)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            earning.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                            earning.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {earning.status === 'paid' ? 'Выплачено' :
                             earning.status === 'pending' ? 'В ожидании' : 'Обрабатывается'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white">
                          {earning.paid_at ? formatDate(earning.paid_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">📊 Месячная статистика</h2>
              
              {monthlyStats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">Статистика пока недоступна</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {monthlyStats.map((stat) => (
                    <div key={stat.month} className="p-4 bg-white/5 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">{stat.month}</span>
                        <span className="text-green-400 font-bold">{formatCurrency(stat.total_earnings)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-300">Транзакций:</span>
                          <span className="text-white ml-2">{stat.transactions_count}</span>
                        </div>
                        <div>
                          <span className="text-gray-300">Среднее:</span>
                          <span className="text-white ml-2">{formatCurrency(stat.average_per_transaction)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Топ заработавший: {stat.top_earner} ({formatCurrency(stat.top_earner_amount)})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">📈 Общая статистика</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatCurrency(monthlyStats.reduce((sum, stat) => sum + stat.total_earnings, 0))}
                  </div>
                  <div className="text-gray-300">Общий заработок</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-white mb-1">
                    {monthlyStats.reduce((sum, stat) => sum + stat.transactions_count, 0)}
                  </div>
                  <div className="text-gray-300">Всего транзакций</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-white mb-1">
                    {monthlyStats.length > 0 ? formatCurrency(
                      monthlyStats.reduce((sum, stat) => sum + stat.total_earnings, 0) / monthlyStats.length
                    ) : '$0.00'}
                  </div>
                  <div className="text-gray-300">Средний заработок в месяц</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Accounts Tab */}
        {activeTab === 'top' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">🏆 Топ аккаунты</h2>
            
            {topAccounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300">Данные о топ аккаунтах пока недоступны</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Место</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Пользователь</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Общий заработок</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Транзакций</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Последняя активность</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAccounts.map((account, index) => (
                      <tr key={account.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-white/10 text-white'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-white font-semibold">{account.full_name}</div>
                            <div className="text-gray-400 text-sm">@{account.username}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white font-semibold">{formatCurrency(account.total_earnings)}</td>
                        <td className="py-3 px-4 text-white">{account.transactions_count}</td>
                        <td className="py-3 px-4 text-white">{formatDate(account.last_activity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔐 Изменить пароль</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Текущий пароль
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Подтвердите новый пароль
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    ✅ Сохранить
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* USDT Update Modal */}
      {showUSDTModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Обновить USDT реквизиты</h2>
              
              <form onSubmit={handleUSDTUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    USDT Адрес (BEP20)
                  </label>
                  <input
                    type="text"
                    required
                    value={usdtForm.usdt_address}
                    onChange={(e) => setUsdtForm({...usdtForm, usdt_address: e.target.value})}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Сеть
                  </label>
                  <select
                    value={usdtForm.usdt_network}
                    onChange={(e) => setUsdtForm({...usdtForm, usdt_network: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BEP20">BEP20 (Binance Smart Chain)</option>
                    <option value="ERC20">ERC20 (Ethereum)</option>
                    <option value="TRC20">TRC20 (Tron)</option>
                  </select>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowUSDTModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    ✅ Сохранить
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
