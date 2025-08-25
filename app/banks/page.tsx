'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Bank {
  id: string
  name: string
  type: 'revolut' | 'uk' | 'other'
  created_at: string
  updated_at: string
}

interface BankAccount {
  id: string
  bank_id: string
  account_name: string
  account_number: string
  sort_code: string
  login_url: string
  login_password: string
  pink_cards_daily_limit: number
  pink_cards_remaining: number
  last_reset_date: string
  created_at: string
  updated_at: string
}

interface Card {
  id: string
  bank_account_id: string
  card_number: string
  expiry_date: string
  cvv: string
  card_type: 'pink' | 'gray'
  status: 'free' | 'assigned' | 'in_process' | 'completed'
  assigned_employee_id: string | null
  assigned_casino_id: string | null
  deposit_amount: number | null
  withdrawal_amount: number | null
  profit: number | null
  created_at: string
  updated_at: string
}

interface User {
  id: string
  username: string
  full_name: string
  role: string
}

export default function BanksPage() {
  const [user, setUser] = useState<User | null>(null)
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddBank, setShowAddBank] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [selectedBank, setSelectedBank] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const router = useRouter()

  const [bankForm, setBankForm] = useState({
    name: '',
    type: 'uk' as 'revolut' | 'uk' | 'other'
  })

  const [accountForm, setAccountForm] = useState({
    bank_id: '',
    account_name: '',
    account_number: '',
    sort_code: '',
    login_url: '',
    login_password: '',
    pink_cards_daily_limit: 5
  })

  const [cardForm, setCardForm] = useState({
    bank_account_id: '',
    card_number: '',
    expiry_date: '',
    cvv: '',
    card_type: 'gray' as 'pink' | 'gray'
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
        
        try {
          const user = JSON.parse(userData)
          setUser(user)
          loadData()
        } catch (error) {
          console.error('Error parsing user data:', error)
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      
      if (!token) {
        toast.error('Токен аутентификации не найден')
        router.push('/login')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [banksRes, accountsRes, cardsRes] = await Promise.all([
        fetch('/api/banks', { headers }),
        fetch('/api/bank-accounts', { headers }),
        fetch('/api/cards', { headers })
      ])

      console.log('Banks response:', banksRes.status)
      console.log('Accounts response:', accountsRes.status)
      console.log('Cards response:', cardsRes.status)

      if (banksRes.ok) {
        const banksData = await banksRes.json()
        setBanks(banksData.banks)
      } else {
        const banksError = await banksRes.json()
        console.error('Banks error:', banksError)
        toast.error('Ошибка загрузки банков: ' + banksError.error)
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setBankAccounts(accountsData.bankAccounts)
      } else {
        const accountsError = await accountsRes.json()
        console.error('Accounts error:', accountsError)
        toast.error('Ошибка загрузки аккаунтов: ' + accountsError.error)
      }

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json()
        setCards(cardsData.cards)
      } else {
        const cardsError = await cardsRes.json()
        console.error('Cards error:', cardsError)
        toast.error('Ошибка загрузки карт: ' + cardsError.error)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      toast.error('Ошибка загрузки данных: ' + errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/banks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bankForm),
      })

      if (response.ok) {
        toast.success('Банк успешно добавлен!')
        setShowAddBank(false)
        setBankForm({ name: '', type: 'uk' })
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка добавления банка')
      }
    } catch (error) {
      console.error('Error adding bank:', error)
      toast.error('Ошибка добавления банка')
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      })

      if (response.ok) {
        toast.success('Аккаунт успешно добавлен!')
        setShowAddAccount(false)
        setAccountForm({
          bank_id: '',
          account_name: '',
          account_number: '',
          sort_code: '',
          login_url: '',
          login_password: '',
          pink_cards_daily_limit: 5
        })
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка добавления аккаунта')
      }
    } catch (error) {
      console.error('Error adding account:', error)
      toast.error('Ошибка добавления аккаунта')
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardForm),
      })

      if (response.ok) {
        toast.success('Карта успешно добавлена!')
        setShowAddCard(false)
        setCardForm({
          bank_account_id: '',
          card_number: '',
          expiry_date: '',
          cvv: '',
          card_type: 'gray'
        })
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка добавления карты')
      }
    } catch (error) {
      console.error('Error adding card:', error)
      toast.error('Ошибка добавления карты')
    }
  }

  const updatePinkCardsRemaining = async (accountId: string, remaining: number) => {
    try {
      const response = await fetch(`/api/bank-accounts/${accountId}/pink-cards`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remaining }),
      })

      if (response.ok) {
        toast.success('Количество розовых карт обновлено!')
        loadData()
      } else {
        toast.error('Ошибка обновления количества карт')
      }
    } catch (error) {
      console.error('Error updating pink cards:', error)
      toast.error('Ошибка обновления количества карт')
    }
  }

  const getStats = () => {
    const totalBanks = banks.length
    const totalAccounts = bankAccounts.length
    const totalCards = cards.length
    const freeCards = cards.filter(c => c.status === 'free').length
    const assignedCards = cards.filter(c => c.status === 'assigned').length
    const inProcessCards = cards.filter(c => c.status === 'in_process').length
    const completedCards = cards.filter(c => c.status === 'completed').length
    const totalProfit = cards
      .filter(c => c.profit !== null)
      .reduce((sum, c) => sum + (c.profit || 0), 0)

    return {
      totalBanks,
      totalAccounts,
      totalCards,
      freeCards,
      assignedCards,
      inProcessCards,
      completedCards,
      totalProfit
    }
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
              <span className="mr-3">🏦</span>
              Управление банками
            </h1>
            <p className="text-gray-600 mt-2">
              Управление банковскими аккаунтами, картами и инвентаризацией
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowAddBank(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="mr-2">🏦</span>
              Добавить банк
            </Button>
            <Button
              onClick={() => setShowAddAccount(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="mr-2">👤</span>
              Добавить аккаунт
            </Button>
            <Button
              onClick={() => setShowAddCard(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="mr-2">💳</span>
              Добавить карту
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-xl">🏦</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Банков</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBanks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-xl">👤</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Аккаунтов</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAccounts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-xl">💳</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Карт</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-white font-bold text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Прибыль</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalProfit)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Banks List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🏦 Банки</h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка банков...</p>
            </div>
          ) : banks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Банки не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Банк</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Аккаунтов</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Карт</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banks.map((bank) => {
                    const bankAccountsCount = bankAccounts.filter(acc => acc.bank_id === bank.id).length
                    const bankCardsCount = cards.filter(card => 
                      bankAccounts.some(acc => acc.id === card.bank_account_id && acc.bank_id === bank.id)
                    ).length

                    return (
                      <tr key={bank.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{bank.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            bank.type === 'revolut' ? 'bg-blue-100 text-blue-800' :
                            bank.type === 'uk' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {bank.type === 'revolut' ? 'Revolut' : 
                             bank.type === 'uk' ? 'UK Bank' : 'Other'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bankAccountsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bankCardsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(bank.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bank Accounts List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">💳 Банковские аккаунты</h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка аккаунтов...</p>
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Аккаунты не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Аккаунт</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Банк</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер счета</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Розовые карты</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Всего карт</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bankAccounts.map((account) => {
                    const bank = banks.find(b => b.id === account.bank_id)
                    const accountCards = cards.filter(card => card.bank_account_id === account.id)
                    const pinkCards = accountCards.filter(card => card.card_type === 'pink')

                    return (
                      <tr key={account.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{account.account_name}</div>
                            <div className="text-sm text-gray-500">{account.login_url}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{bank?.name || 'Неизвестно'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">****{account.account_number.slice(-4)}</div>
                          <div className="text-sm text-gray-500">{account.sort_code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">
                              {account.pink_cards_remaining}/{account.pink_cards_daily_limit}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={account.pink_cards_daily_limit}
                              value={account.pink_cards_remaining}
                              onChange={(e) => updatePinkCardsRemaining(account.id, parseInt(e.target.value))}
                              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {accountCards.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => {
                              setSelectedAccount(account.id)
                              setCardForm({...cardForm, bank_account_id: account.id})
                              setShowAddCard(true)
                            }}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-1 rounded-lg text-xs transition-all duration-300"
                          >
                            Добавить карту
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cards List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Карты</h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка карт...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Карты не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Карта</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Аккаунт</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Прибыль</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cards.map((card) => {
                    const account = bankAccounts.find(acc => acc.id === card.bank_account_id)
                    const bank = banks.find(b => b.id === account?.bank_id)

                    return (
                      <tr key={card.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">****{card.card_number.slice(-4)}</div>
                            <div className="text-sm text-gray-500">{card.expiry_date}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            card.card_type === 'pink' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {card.card_type === 'pink' ? '🩷 Розовая' : '⚫ Серая'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            card.status === 'free' ? 'bg-green-100 text-green-800' :
                            card.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                            card.status === 'in_process' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {card.status === 'free' ? 'Свободна' :
                             card.status === 'assigned' ? 'Назначена' :
                             card.status === 'in_process' ? 'В процессе' : 'Завершена'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{account?.account_name || 'Неизвестно'}</div>
                            <div className="text-sm text-gray-500">{bank?.name || 'Неизвестно'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {card.profit ? formatCurrency(card.profit) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(card.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Bank Modal */}
      {showAddBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Добавить банк</h2>
                <button
                  onClick={() => setShowAddBank(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddBank} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название банка *</label>
                  <input
                    type="text"
                    required
                    value={bankForm.name}
                    onChange={(e) => setBankForm({...bankForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Название банка"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип банка *</label>
                  <select
                    required
                    value={bankForm.type}
                    onChange={(e) => setBankForm({...bankForm, type: e.target.value as 'revolut' | 'uk' | 'other'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="uk">UK Bank</option>
                    <option value="revolut">Revolut</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowAddBank(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Добавить банк
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Добавить аккаунт</h2>
                <button
                  onClick={() => setShowAddAccount(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Банк *</label>
                  <select
                    required
                    value={accountForm.bank_id}
                    onChange={(e) => setAccountForm({...accountForm, bank_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Выберите банк</option>
                    {banks.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название аккаунта *</label>
                  <input
                    type="text"
                    required
                    value={accountForm.account_name}
                    onChange={(e) => setAccountForm({...accountForm, account_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Имя владельца аккаунта"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Номер счета *</label>
                    <input
                      type="text"
                      required
                      value={accountForm.account_number}
                      onChange={(e) => setAccountForm({...accountForm, account_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="12345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Code *</label>
                    <input
                      type="text"
                      required
                      value={accountForm.sort_code}
                      onChange={(e) => setAccountForm({...accountForm, sort_code: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="12-34-56"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL для входа *</label>
                  <input
                    type="url"
                    required
                    value={accountForm.login_url}
                    onChange={(e) => setAccountForm({...accountForm, login_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="https://example.com/login"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Пароль для входа *</label>
                  <input
                    type="password"
                    required
                    value={accountForm.login_password}
                    onChange={(e) => setAccountForm({...accountForm, login_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Пароль"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Лимит розовых карт в день</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={accountForm.pink_cards_daily_limit}
                    onChange={(e) => setAccountForm({...accountForm, pink_cards_daily_limit: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="5"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowAddAccount(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Добавить аккаунт
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Добавить карту</h2>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Банковский аккаунт *</label>
                  <select
                    required
                    value={cardForm.bank_account_id}
                    onChange={(e) => setCardForm({...cardForm, bank_account_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Выберите аккаунт</option>
                    {bankAccounts.map(account => {
                      const bank = banks.find(b => b.id === account.bank_id)
                      return (
                        <option key={account.id} value={account.id}>
                          {account.account_name} - {bank?.name}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Номер карты *</label>
                  <input
                    type="text"
                    required
                    value={cardForm.card_number}
                    onChange={(e) => setCardForm({...cardForm, card_number: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Срок действия *</label>
                    <input
                      type="text"
                      required
                      value={cardForm.expiry_date}
                      onChange={(e) => setCardForm({...cardForm, expiry_date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                    <input
                      type="text"
                      required
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип карты *</label>
                  <select
                    required
                    value={cardForm.card_type}
                    onChange={(e) => setCardForm({...cardForm, card_type: e.target.value as 'pink' | 'gray'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="gray">⚫ Серая</option>
                    <option value="pink">🩷 Розовая</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Добавить карту
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
