'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface TestSite {
  id: string
  casino_name: string
  promo_link: string
  card_bins: string[]
  currency: string
  withdrawal_time: number
  withdrawal_time_unit: 'instant' | 'minutes' | 'hours'
  manual?: string
  status: 'active' | 'processing' | 'testing'
  created_at: string
  updated_at: string
}

interface TestEntry {
  id: string
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
  issue_description?: string
  created_at: string
  updated_at: string
}

export default function TestSitesPage() {
  const [testSites, setTestSites] = useState<TestSite[]>([])
  const [testEntries, setTestEntries] = useState<TestEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [showNewSiteForm, setShowNewSiteForm] = useState(false)
  const [showNewTestForm, setShowNewTestForm] = useState(false)
  const [currentMonth, setCurrentMonth] = useState('')
  const [siteFormData, setSiteFormData] = useState({
    casino_name: '',
    promo_link: '',
    card_bins: '',
    currency: 'USD',
    withdrawal_time: '',
    withdrawal_time_unit: 'instant' as 'instant' | 'minutes' | 'hours',
    manual: '',
    status: 'testing' as 'active' | 'processing' | 'testing'
  })
  const [testFormData, setTestFormData] = useState({
    casino_name: '',
    deposit_amount: '',
    withdrawal_amount: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    account_username: '',
    account_password: '',
    card_type: 'pink' as 'pink' | 'gray',
    bank_name: '',
    withdrawal_status: 'new' as 'new' | 'sent' | 'received' | 'problem' | 'blocked',
    issue_description: ''
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
      setCurrentMonth(new Date().toISOString().slice(0, 7))
      loadTestSites()
      loadTestEntries()
    } else {
      router.push('/login')
    }
  }, [])

  const loadTestSites = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/test-sites', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestSites(data.sites || [])
      } else {
        console.error('Failed to load test sites')
        toast.error('Ошибка загрузки тестовых сайтов')
      }
    } catch (error) {
      console.error('Test sites error:', error)
      toast.error('Ошибка загрузки тестовых сайтов')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTestEntries = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/test-sites/entries', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestEntries(data.entries || [])
      }
    } catch (error) {
      console.error('Test entries error:', error)
    }
  }

  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/test-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...siteFormData,
          card_bins: siteFormData.card_bins.split(',').map(bin => bin.trim())
        })
      })

      if (response.ok) {
        toast.success('Тестовый сайт успешно добавлен!')
        setShowNewSiteForm(false)
        setSiteFormData({
          casino_name: '',
          promo_link: '',
          card_bins: '',
          currency: 'USD',
          withdrawal_time: '',
          withdrawal_time_unit: 'instant',
          manual: '',
          status: 'testing'
        })
        loadTestSites()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка добавления тестового сайта')
      }
    } catch (error) {
      console.error('Site submit error:', error)
      toast.error('Ошибка добавления тестового сайта')
    }
  }

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/test-sites/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testFormData)
      })

      if (response.ok) {
        toast.success('Тестовая запись успешно добавлена!')
        setShowNewTestForm(false)
        setTestFormData({
          casino_name: '',
          deposit_amount: '',
          withdrawal_amount: '',
          card_number: '',
          card_expiry: '',
          card_cvv: '',
          account_username: '',
          account_password: '',
          card_type: 'pink',
          bank_name: '',
          withdrawal_status: 'new',
          issue_description: ''
        })
        loadTestEntries()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка добавления тестовой записи')
      }
    } catch (error) {
      console.error('Test submit error:', error)
      toast.error('Ошибка добавления тестовой записи')
    }
  }

  const updateSiteStatus = async (siteId: string, status: string) => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch(`/api/test-sites/${siteId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('Статус сайта обновлен!')
        loadTestSites()
      } else {
        toast.error('Ошибка обновления статуса сайта')
      }
    } catch (error) {
      console.error('Site status update error:', error)
      toast.error('Ошибка обновления статуса сайта')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-500 to-green-600'
      case 'processing': return 'from-yellow-500 to-yellow-600'
      case 'testing': return 'from-blue-500 to-blue-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅'
      case 'processing': return '⏳'
      case 'testing': return '🧪'
      default: return '❓'
    }
  }

  const getWithdrawalTimeText = (time: number, unit: string) => {
    if (unit === 'instant') return 'Мгновенно'
    if (time === 1) {
      return unit === 'minutes' ? '1 минута' : '1 час'
    }
    return `${time} ${unit === 'minutes' ? 'минут' : 'часов'}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка тестовых сайтов...</p>
        </div>
      </div>
    )
  }

  if (userRole !== 'Tester') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Navigation userRole={userRole} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h3>
            <p className="text-gray-600">Только тестировщики могут просматривать тестовые сайты</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navigation userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Тестовые сайты</h1>
              <p className="text-gray-600">Месяц: {currentMonth}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowNewSiteForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🌐 Добавить сайт
              </Button>
              <Button
                onClick={() => setShowNewTestForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                📝 Добавить тест
              </Button>
            </div>
          </div>
        </div>

        {/* Test Sites */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🌐 Тестовые сайты</h2>
          
          {testSites.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌐</div>
              <p className="text-gray-600">Нет добавленных тестовых сайтов</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testSites.map((site) => (
                <div key={site.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{site.casino_name}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(site.status)} text-white`}>
                      {getStatusIcon(site.status)} {site.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">🔗 Промо ссылка:</span>
                      <a href={site.promo_link} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:text-blue-800 truncate">
                        {site.promo_link}
                      </a>
                    </div>
                    
                    <div>
                      <span className="text-sm font-semibold text-gray-700">💳 БИНы карт:</span>
                      <div className="text-sm text-gray-900">
                        {site.card_bins.join(', ')}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-semibold text-gray-700">💰 Валюта:</span>
                      <span className="text-sm text-gray-900 ml-2">{site.currency}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-semibold text-gray-700">⏱️ Время вывода:</span>
                      <span className="text-sm text-gray-900 ml-2">
                        {getWithdrawalTimeText(site.withdrawal_time, site.withdrawal_time_unit)}
                      </span>
                    </div>
                    
                    {site.manual && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">📋 Мануал:</span>
                        <p className="text-sm text-gray-900 mt-1">{site.manual}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <select
                      value={site.status}
                      onChange={(e) => updateSiteStatus(site.id, e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="testing">🧪 Тестирование</option>
                      <option value="processing">⏳ Обработка</option>
                      <option value="active">✅ Активный</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Entries */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Тестовые записи</h2>
          
          {testEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600">Нет тестовых записей за текущий месяц</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Казино</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Депозит</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Вывод</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Карта</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Тип</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Банк</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {testEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">{entry.casino_name}</div>
                          <div className="text-sm text-gray-500">{entry.account_username}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(entry.deposit_amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-blue-600 font-semibold">
                          {formatCurrency(entry.withdrawal_amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm">
                          {entry.card_number.slice(0, 4)} **** **** {entry.card_number.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.card_expiry} | {entry.card_cvv}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.card_type === 'pink' 
                            ? 'bg-pink-100 text-pink-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.card_type === 'pink' ? '🩷 Розовая' : '⚫ Серая'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{entry.bank_name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${
                          entry.withdrawal_status === 'received' ? 'from-green-500 to-green-600' :
                          entry.withdrawal_status === 'sent' ? 'from-yellow-500 to-yellow-600' :
                          entry.withdrawal_status === 'problem' ? 'from-red-500 to-red-600' :
                          'from-blue-500 to-blue-600'
                        } text-white`}>
                          {entry.withdrawal_status === 'received' ? '✅' :
                           entry.withdrawal_status === 'sent' ? '📤' :
                           entry.withdrawal_status === 'problem' ? '⚠️' : '🆕'} {entry.withdrawal_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Site Modal */}
      {showNewSiteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🌐 Добавить тестовый сайт</h2>
              
              <form onSubmit={handleSiteSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎰 Название казино
                    </label>
                    <input
                      type="text"
                      required
                      value={siteFormData.casino_name}
                      onChange={(e) => setSiteFormData({...siteFormData, casino_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔗 Промо ссылка
                    </label>
                    <input
                      type="url"
                      required
                      value={siteFormData.promo_link}
                      onChange={(e) => setSiteFormData({...siteFormData, promo_link: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💳 БИНы карт (через запятую)
                    </label>
                    <input
                      type="text"
                      required
                      value={siteFormData.card_bins}
                      onChange={(e) => setSiteFormData({...siteFormData, card_bins: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123456, 789012, 345678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💰 Валюта
                    </label>
                    <select
                      value={siteFormData.currency}
                      onChange={(e) => setSiteFormData({...siteFormData, currency: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="RUB">RUB</option>
                      <option value="UAH">UAH</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⏱️ Время вывода
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={siteFormData.withdrawal_time}
                        onChange={(e) => setSiteFormData({...siteFormData, withdrawal_time: e.target.value})}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                      <select
                        value={siteFormData.withdrawal_time_unit}
                        onChange={(e) => setSiteFormData({...siteFormData, withdrawal_time_unit: e.target.value as 'instant' | 'minutes' | 'hours'})}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="instant">Мгновенно</option>
                        <option value="minutes">Минут</option>
                        <option value="hours">Часов</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📊 Статус
                    </label>
                    <select
                      value={siteFormData.status}
                      onChange={(e) => setSiteFormData({...siteFormData, status: e.target.value as 'active' | 'processing' | 'testing'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="testing">🧪 Тестирование</option>
                      <option value="processing">⏳ Обработка</option>
                      <option value="active">✅ Активный</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📋 Мануал (опционально)
                  </label>
                  <textarea
                    value={siteFormData.manual}
                    onChange={(e) => setSiteFormData({...siteFormData, manual: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Инструкции по работе с сайтом..."
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowNewSiteForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    ✅ Сохранить
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Test Modal */}
      {showNewTestForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Добавить тестовую запись</h2>
              
              <form onSubmit={handleTestSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎰 Название казино
                    </label>
                    <input
                      type="text"
                      required
                      value={testFormData.casino_name}
                      onChange={(e) => setTestFormData({...testFormData, casino_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💰 Сумма депозита
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={testFormData.deposit_amount}
                      onChange={(e) => setTestFormData({...testFormData, deposit_amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💸 Сумма вывода
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={testFormData.withdrawal_amount}
                      onChange={(e) => setTestFormData({...testFormData, withdrawal_amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💳 Номер карты
                    </label>
                    <input
                      type="text"
                      required
                      value={testFormData.card_number}
                      onChange={(e) => setTestFormData({...testFormData, card_number: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Срок действия
                    </label>
                    <input
                      type="text"
                      required
                      value={testFormData.card_expiry}
                      onChange={(e) => setTestFormData({...testFormData, card_expiry: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔐 CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={testFormData.card_cvv}
                      onChange={(e) => setTestFormData({...testFormData, card_cvv: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Логин аккаунта
                    </label>
                    <input
                      type="text"
                      required
                      value={testFormData.account_username}
                      onChange={(e) => setTestFormData({...testFormData, account_username: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔑 Пароль аккаунта
                    </label>
                    <input
                      type="password"
                      required
                      value={testFormData.account_password}
                      onChange={(e) => setTestFormData({...testFormData, account_password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎨 Тип карты
                    </label>
                    <select
                      value={testFormData.card_type}
                      onChange={(e) => setTestFormData({...testFormData, card_type: e.target.value as 'pink' | 'gray'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pink">🩷 Розовая</option>
                      <option value="gray">⚫ Серая</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏦 Банк карты
                    </label>
                    <input
                      type="text"
                      required
                      value={testFormData.bank_name}
                      onChange={(e) => setTestFormData({...testFormData, bank_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Описание проблемы (если есть)
                  </label>
                  <textarea
                    value={testFormData.issue_description}
                    onChange={(e) => setTestFormData({...testFormData, issue_description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Опишите проблему с выводом..."
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowNewTestForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
