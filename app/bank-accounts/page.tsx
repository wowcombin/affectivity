'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface BankAccount {
  id: string
  bank_name: string
  bank_country: string
  account_number: string
  sort_code: string
  login_url: string
  login_username: string
  login_password: string
  pink_cards_limit: number
  created_at: string
  updated_at: string
  cards: Card[]
}

interface Card {
  id: string
  card_number: string
  card_expiry: string
  card_cvv: string
  card_type: 'pink' | 'gray'
  is_active: boolean
  assigned_to?: string
  assigned_site?: string
  times_assigned: number
  times_worked: number
  created_at: string
}

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    bank_name: '',
    bank_country: '',
    account_number: '',
    sort_code: '',
    login_url: '',
    login_username: '',
    login_password: ''
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
      loadBankAccounts()
    } else {
      router.push('/login')
    }
  }, [])

  const loadBankAccounts = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/bank-accounts', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBankAccounts(data.bankAccounts || [])
      } else {
        console.error('Failed to load bank accounts')
        toast.error('Ошибка загрузки банковских аккаунтов')
      }
    } catch (error) {
      console.error('Bank accounts error:', error)
      toast.error('Ошибка загрузки банковских аккаунтов')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...formData,
          pink_cards_limit: 5 // Всегда 5 для розовых карт
        })
      })

      if (response.ok) {
        toast.success('Банковский аккаунт успешно добавлен!')
        setShowCreateForm(false)
        setFormData({
          bank_name: '',
          bank_country: '',
          account_number: '',
          sort_code: '',
          login_url: '',
          login_username: '',
          login_password: ''
        })
        loadBankAccounts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка добавления банковского аккаунта')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Ошибка добавления банковского аккаунта')
    }
  }

  const getCardTypeColor = (type: string) => {
    return type === 'pink' ? 'from-pink-500 to-pink-600' : 'from-gray-500 to-gray-600'
  }

  const getCardTypeIcon = (type: string) => {
    return type === 'pink' ? '🩷' : '⚫'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка банковских аккаунтов...</p>
        </div>
      </div>
    )
  }

  if (!['Admin', 'CFO'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Navigation userRole={userRole} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h3>
            <p className="text-gray-600">Только администраторы и CFO могут управлять банковскими аккаунтами</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🏦 Банковские аккаунты</h1>
              <p className="text-gray-600">Управление банковскими аккаунтами и картами</p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                ➕ Добавить аккаунт
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🏦</div>
              <div>
                <p className="text-sm text-gray-600">Всего аккаунтов</p>
                <p className="text-2xl font-bold text-gray-900">{bankAccounts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💳</div>
              <div>
                <p className="text-sm text-gray-600">Всего карт</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bankAccounts.reduce((sum, account) => sum + account.cards.length, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🩷</div>
              <div>
                <p className="text-sm text-gray-600">Розовые карты</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bankAccounts.reduce((sum, account) => 
                    sum + account.cards.filter(card => card.card_type === 'pink').length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⚫</div>
              <div>
                <p className="text-sm text-gray-600">Серые карты</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bankAccounts.reduce((sum, account) => 
                    sum + account.cards.filter(card => card.card_type === 'gray').length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Accounts List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Список банковских аккаунтов</h2>
          
          {bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏦</div>
              <p className="text-gray-600">Нет добавленных банковских аккаунтов</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bankAccounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                  {/* Account Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">🏦 {account.bank_name}</h3>
                      <p className="text-sm text-gray-600">{account.bank_country}</p>
                      <p className="text-sm text-gray-600">Счет: {account.account_number}</p>
                      <p className="text-sm text-gray-600">Сорт: {account.sort_code}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🔗 Данные входа</h4>
                      <a href={account.login_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm block">
                        {account.login_url}
                      </a>
                      <p className="text-sm text-gray-600">Логин: {account.login_username}</p>
                      <p className="text-sm text-gray-600">Пароль: {account.login_password}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📊 Статистика карт</h4>
                      <p className="text-sm text-gray-600">
                        Розовые: {account.cards.filter(c => c.card_type === 'pink').length} / {account.pink_cards_limit}
                      </p>
                      <p className="text-sm text-gray-600">
                        Серые: {account.cards.filter(c => c.card_type === 'gray').length}
                      </p>
                      <p className="text-sm text-gray-600">
                        Всего: {account.cards.length}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📅 Информация</h4>
                      <p className="text-sm text-gray-600">Создан: {formatDate(account.created_at)}</p>
                      <p className="text-sm text-gray-600">Обновлен: {formatDate(account.updated_at)}</p>
                    </div>
                  </div>

                  {/* Cards */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">💳 Карты</h4>
                    {account.cards.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Нет добавленных карт</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {account.cards.map((card) => (
                          <div key={card.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getCardTypeColor(card.card_type)} text-white`}>
                                {getCardTypeIcon(card.card_type)} {card.card_type === 'pink' ? 'Розовая' : 'Серая'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${card.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {card.is_active ? '✅ Активна' : '❌ Неактивна'}
                              </span>
                            </div>
                            
                            <div className="font-mono text-sm mb-2">
                              <div className="text-gray-900">{card.card_number}</div>
                              <div className="text-gray-500">{card.card_expiry} | {card.card_cvv}</div>
                            </div>
                            
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Назначена: {card.times_assigned} раз</div>
                              <div>Отработана: {card.times_worked} раз</div>
                              {card.assigned_to && (
                                <div>Назначена: {card.assigned_to}</div>
                              )}
                              {card.assigned_site && (
                                <div>Сайт: {card.assigned_site}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Bank Account Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Добавить банковский аккаунт</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏦 Название банка
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🌍 Страна банка
                    </label>
                    <select
                      required
                      value={formData.bank_country}
                      onChange={(e) => setFormData({...formData, bank_country: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Выберите страну</option>
                      <option value="UK">🇬🇧 UK</option>
                      <option value="IE">🇮🇪 IE</option>
                      <option value="DE">🇩🇪 DE</option>
                      <option value="ES">🇪🇸 ES</option>
                      <option value="FR">🇫🇷 FR</option>
                      <option value="IT">🇮🇹 IT</option>
                      <option value="NL">🇳🇱 NL</option>
                      <option value="BE">🇧🇪 BE</option>
                      <option value="AT">🇦🇹 AT</option>
                      <option value="CH">🇨🇭 CH</option>
                      <option value="PL">🇵🇱 PL</option>
                      <option value="CZ">🇨🇿 CZ</option>
                      <option value="HU">🇭🇺 HU</option>
                      <option value="RO">🇷🇴 RO</option>
                      <option value="BG">🇧🇬 BG</option>
                      <option value="HR">🇭🇷 HR</option>
                      <option value="SI">🇸🇮 SI</option>
                      <option value="SK">🇸🇰 SK</option>
                      <option value="LT">🇱🇹 LT</option>
                      <option value="LV">🇱🇻 LV</option>
                      <option value="EE">🇪🇪 EE</option>
                      <option value="FI">🇫🇮 FI</option>
                      <option value="SE">🇸🇪 SE</option>
                      <option value="DK">🇩🇰 DK</option>
                      <option value="NO">🇳🇴 NO</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 Номер счета
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.account_number}
                      onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔢 Сортовой код
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sort_code}
                      onChange={(e) => setFormData({...formData, sort_code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔗 URL для входа
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.login_url}
                      onChange={(e) => setFormData({...formData, login_url: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Логин
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.login_username}
                      onChange={(e) => setFormData({...formData, login_username: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔐 Пароль
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.login_password}
                      onChange={(e) => setFormData({...formData, login_password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Примечание:</strong> Лимит розовых карт автоматически установлен на 5 и не может быть изменен.
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl"
                  >
                    Добавить аккаунт
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
