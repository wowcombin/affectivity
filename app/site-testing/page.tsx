'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface SiteTest {
  id: string
  site_name: string
  site_url: string
  deposit_amount: number
  withdrawal_amount: number
  card_number: string
  card_expiry: string
  card_cvv: string
  username: string
  password: string
  bank_name: string
  address: string
  withdrawal_time: string
  withdrawal_time_type: 'minutes' | 'hours' | 'instant'
  status: 'active' | 'inactive' | 'testing' | 'completed'
  notes: string | null
  tested_by: string
  created_at: string
  users: {
    username: string
    full_name: string
  }
}

export default function SiteTestingPage() {
  const [siteTests, setSiteTests] = useState<SiteTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTimeType, setFilterTimeType] = useState('all')
  
  const [formData, setFormData] = useState({
    site_name: '',
    site_url: '',
    deposit_amount: '',
    withdrawal_amount: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    username: '',
    password: '',
    bank_name: '',
    address: '',
    withdrawal_time: '',
    withdrawal_time_type: 'minutes',
    status: 'testing',
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
    loadSiteTests()
  }, [])

  const loadSiteTests = async () => {
    try {
      // Пока используем моковые данные
      const mockSiteTests: SiteTest[] = [
        {
          id: '1',
          site_name: '888casino',
          site_url: 'https://888casino.com',
          deposit_amount: 10.00,
          withdrawal_amount: 0.00,
          card_number: '4165490365359112',
          card_expiry: '08/30',
          card_cvv: '123',
          username: 'aidenjames71',
          password: 'Affectingaf^',
          bank_name: 'Isha Imani',
          address: 'MK6 2BB, 32 Pencarrow Place, Milton Keynes',
          withdrawal_time: '24',
          withdrawal_time_type: 'hours',
          status: 'completed',
          notes: 'Быстрый вывод, хороший сайт',
          tested_by: '1',
          created_at: new Date().toISOString(),
          users: { username: 'tester1', full_name: 'John Tester' }
        },
        {
          id: '2',
          site_name: 'hippodromeonline',
          site_url: 'https://hippodromeonline.com',
          deposit_amount: 20.00,
          withdrawal_amount: 93.62,
          card_number: '5354567967473413',
          card_expiry: '08/30',
          card_cvv: '456',
          username: 'michaelcook',
          password: 'ACcountacting$',
          bank_name: 'Zenah Zghaibeh',
          address: 'M45 7HH, 7 Westlands, Manchester',
          withdrawal_time: '2',
          withdrawal_time_type: 'hours',
          status: 'active',
          notes: 'Отличный профит',
          tested_by: '1',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          users: { username: 'tester1', full_name: 'John Tester' }
        },
        {
          id: '3',
          site_name: 'lottoland',
          site_url: 'https://lottoland.com',
          deposit_amount: 25.00,
          withdrawal_amount: 0.00,
          card_number: '4165490346209824',
          card_expiry: '08/30',
          card_cvv: '789',
          username: 'liam_nguyen',
          password: 'Acetoneacet#',
          bank_name: 'Suhail Neame',
          address: '38 Levison Way, N19 3XE, London',
          withdrawal_time: 'instant',
          withdrawal_time_type: 'instant',
          status: 'testing',
          notes: 'Тестируется',
          tested_by: '2',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          users: { username: 'tester2', full_name: 'Sarah Tester' }
        }
      ]
      setSiteTests(mockSiteTests)
    } catch (error) {
      console.error('Error loading site tests:', error)
      toast.error('Ошибка загрузки тестов сайтов')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSiteTest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Здесь будет API для добавления теста сайта
      toast.success('Тест сайта успешно добавлен!')
      setShowAddForm(false)
      setFormData({
        site_name: '',
        site_url: '',
        deposit_amount: '',
        withdrawal_amount: '',
        card_number: '',
        card_expiry: '',
        card_cvv: '',
        username: '',
        password: '',
        bank_name: '',
        address: '',
        withdrawal_time: '',
        withdrawal_time_type: 'minutes',
        status: 'testing',
        notes: ''
      })
      loadSiteTests()
    } catch (error) {
      console.error('Error adding site test:', error)
      toast.error('Ошибка добавления теста сайта')
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

  const getFilteredSiteTests = () => {
    let filtered = siteTests

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus)
    }

    if (filterTimeType !== 'all') {
      filtered = filtered.filter(s => s.withdrawal_time_type === filterTimeType)
    }

    return filtered
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-500 to-green-600'
      case 'inactive': return 'from-gray-500 to-gray-600'
      case 'testing': return 'from-yellow-500 to-orange-500'
      case 'completed': return 'from-blue-500 to-blue-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅'
      case 'inactive': return '⏸️'
      case 'testing': return '🧪'
      case 'completed': return '✅'
      default: return '❓'
    }
  }

  const getTimeTypeIcon = (type: string) => {
    switch (type) {
      case 'minutes': return '⏱️'
      case 'hours': return '🕐'
      case 'instant': return '⚡'
      default: return '⏰'
    }
  }

  const canAddTests = ['Admin', 'Manager', 'Tester'].includes(userRole)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка тестов сайтов...</p>
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
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Всего тестов</h3>
                <p className="text-3xl font-bold text-blue-600">{siteTests.length}</p>
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
                  {siteTests.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Тестируется</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {siteTests.filter(s => s.status === 'testing').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Общий профит</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(siteTests.reduce((sum, s) => sum + s.withdrawal_amount - s.deposit_amount, 0))}
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
                Статус
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">Все статусы</option>
                <option value="active">✅ Активные</option>
                <option value="testing">🧪 Тестируется</option>
                <option value="completed">✅ Завершено</option>
                <option value="inactive">⏸️ Неактивные</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Время вывода
              </label>
              <select
                value={filterTimeType}
                onChange={(e) => setFilterTimeType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">Все типы</option>
                <option value="instant">⚡ Мгновенно</option>
                <option value="minutes">⏱️ Минуты</option>
                <option value="hours">🕐 Часы</option>
              </select>
            </div>
          </div>
        </div>

        {/* Site Tests List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">🧪 Тестирование сайтов</h2>
              {canAddTests && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  ✨ + Добавить тест
                </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    🎰 Сайт
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💰 Депозит/Вывод
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💳 Карта
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👤 Аккаунт
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    🏦 Банк
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ⏰ Время вывода
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📊 Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👨‍💼 Тестировщик
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-white/20">
                {getFilteredSiteTests().map((siteTest) => (
                  <tr key={siteTest.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <span className="text-lg">🎰</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {siteTest.site_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            <a href={siteTest.site_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              {siteTest.site_url}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg inline-block">
                          +{formatCurrency(siteTest.deposit_amount)}
                        </div>
                        <div className={`text-sm font-bold px-2 py-1 rounded-lg inline-block ${
                          siteTest.withdrawal_amount > 0 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-500 bg-gray-50'
                        }`}>
                          {siteTest.withdrawal_amount > 0 ? '+' : ''}{formatCurrency(siteTest.withdrawal_amount)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {siteTest.card_number}
                      </div>
                      <div className="text-sm text-gray-600">
                        {siteTest.card_expiry} • {siteTest.card_cvv}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {siteTest.username}
                      </div>
                      <div className="text-sm text-gray-600 font-mono">
                        {siteTest.password}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {siteTest.bank_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {siteTest.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {getTimeTypeIcon(siteTest.withdrawal_time_type)} {siteTest.withdrawal_time}
                        {siteTest.withdrawal_time_type !== 'instant' && (
                          <span className="text-gray-500 ml-1">
                            {siteTest.withdrawal_time_type === 'minutes' ? 'мин' : 'ч'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getStatusColor(siteTest.status)} text-white shadow-lg`}>
                        {getStatusIcon(siteTest.status)} {
                          siteTest.status === 'active' ? 'Активен' :
                          siteTest.status === 'testing' ? 'Тестируется' :
                          siteTest.status === 'completed' ? 'Завершен' :
                          siteTest.status === 'inactive' ? 'Неактивен' : siteTest.status
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {siteTest.users.full_name || siteTest.users.username}
                      </div>
                      <div className="text-sm text-gray-600">
                        @{siteTest.users.username}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Site Test Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-2xl shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md">
            <div className="mt-3">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">🧪</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Добавить тест сайта
                </h3>
                <p className="text-gray-600">Заполните данные для тестирования сайта</p>
              </div>
              
              <form onSubmit={handleAddSiteTest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎰 Название сайта
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.site_name}
                      onChange={(e) => setFormData({...formData, site_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="888casino"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🌐 URL сайта
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.site_url}
                      onChange={(e) => setFormData({...formData, site_url: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💰 Сумма депозита
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="10.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💸 Сумма вывода
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.withdrawal_amount}
                      onChange={(e) => setFormData({...formData, withdrawal_amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💳 Номер карты
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.card_number}
                      onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="4165490365359112"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Срок действия
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.card_expiry}
                      onChange={(e) => setFormData({...formData, card_expiry: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="08/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔒 CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.card_cvv}
                      onChange={(e) => setFormData({...formData, card_cvv: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Имя пользователя
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔑 Пароль
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏦 Название банка
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Bank Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📍 Адрес
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⏰ Время вывода
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.withdrawal_time}
                      onChange={(e) => setFormData({...formData, withdrawal_time: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🕐 Тип времени
                    </label>
                    <select
                      value={formData.withdrawal_time_type}
                      onChange={(e) => setFormData({...formData, withdrawal_time_type: e.target.value as any})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="instant">⚡ Мгновенно</option>
                      <option value="minutes">⏱️ Минуты</option>
                      <option value="hours">🕐 Часы</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Заметки
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    rows={3}
                    placeholder="Дополнительные заметки..."
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
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ✨ Добавить тест
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
