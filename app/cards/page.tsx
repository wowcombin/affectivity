'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Card {
  id: string
  card_number: string
  expiry_date: string
  cvv: string
  card_type: 'pink' | 'gray'
  status: 'free' | 'assigned' | 'in_process' | 'completed'
  assigned_employee_id?: string
  assigned_casino_id?: string
  deposit_amount?: number
  withdrawal_amount?: number
  profit?: number
  created_at: string
  bank_accounts?: {
    id: string
    account_name: string
    banks?: {
      id: string
      name: string
      country: string
    }
  }
}

interface Employee {
  id: string
  first_name: string
  last_name: string
  username: string
}

interface TestSite {
  id: string
  casino_name: string
  status: 'active' | 'processing' | 'testing'
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [testSites, setTestSites] = useState<TestSite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [assignmentData, setAssignmentData] = useState({
    employeeId: '',
    siteId: ''
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
      loadData()
    } else {
      router.push('/login')
    }
  }, [])

  const loadData = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      
      // Загружаем карты
      const cardsResponse = await fetch('/api/cards', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json()
        setCards(cardsData.cards || [])
      }

      // Загружаем сотрудников
      const employeesResponse = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json()
        setEmployees(employeesData.employees || [])
      }

      // Загружаем тестовые сайты
      const sitesResponse = await fetch('/api/test-sites', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json()
        setTestSites(sitesData.sites || [])
      }

    } catch (error) {
      console.error('Load data error:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedCards.length === cards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(cards.map(card => card.id))
    }
  }

  const handleSelectCard = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId))
    } else {
      setSelectedCards([...selectedCards, cardId])
    }
  }

  const handleMassAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedCards.length === 0) {
      toast.error('Выберите карты для назначения')
      return
    }

    if (!assignmentData.employeeId || !assignmentData.siteId) {
      toast.error('Выберите сотрудника и сайт')
      return
    }

    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/cards/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          cardIds: selectedCards,
          employeeId: assignmentData.employeeId,
          siteId: assignmentData.siteId
        })
      })

      if (response.ok) {
        toast.success(`Карты успешно назначены!`)
        setShowAssignmentModal(false)
        setSelectedCards([])
        setAssignmentData({ employeeId: '', siteId: '' })
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка назначения карт')
      }
    } catch (error) {
      console.error('Assignment error:', error)
      toast.error('Ошибка назначения карт')
    }
  }

  const getCardTypeColor = (type: string) => {
    return type === 'pink' ? 'from-pink-500 to-pink-600' : 'from-gray-500 to-gray-600'
  }

  const getCardTypeIcon = (type: string) => {
    return type === 'pink' ? '🩷' : '⚫'
  }

  const getStatusColor = (timesAssigned: number, timesWorked: number) => {
    if (timesAssigned === 0) return 'from-gray-500 to-gray-600'
    if (timesWorked === 0) return 'from-yellow-500 to-yellow-600'
    if (timesWorked < timesAssigned) return 'from-orange-500 to-orange-600'
    return 'from-green-500 to-green-600'
  }

  const getStatusText = (timesAssigned: number, timesWorked: number) => {
    if (timesAssigned === 0) return 'Не назначена'
    if (timesWorked === 0) return 'В процессе'
    if (timesWorked < timesAssigned) return 'Частично отработана'
    return 'Отработана'
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'free': return 'bg-green-100 text-green-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'in_process': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case 'free': return '🆓 Свободна'
      case 'assigned': return '📋 Назначена'
      case 'in_process': return '⏳ В процессе'
      case 'completed': return '✅ Завершена'
      default: return '❓ Неизвестно'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка карт...</p>
        </div>
      </div>
    )
  }

  if (!['Admin', 'CFO', 'Manager'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Navigation userRole={userRole} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h3>
            <p className="text-gray-600">Только администраторы, CFO и менеджеры могут управлять картами</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Управление картами</h1>
              <p className="text-gray-600">Назначение карт сотрудникам на тестовые сайты</p>
            </div>
            <div className="flex space-x-4">
              {selectedCards.length > 0 && (
                <Button
                  onClick={() => setShowAssignmentModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  📋 Назначить выбранные ({selectedCards.length})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💳</div>
              <div>
                <p className="text-sm text-gray-600">Всего карт</p>
                <p className="text-2xl font-bold text-gray-900">{cards.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🩷</div>
              <div>
                <p className="text-sm text-gray-600">Розовые карты</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cards.filter(card => card.card_type === 'pink').length}
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
                  {cards.filter(card => card.card_type === 'gray').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <p className="text-sm text-gray-600">Свободные карты</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cards.filter(card => card.status === 'free').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Список карт</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCards.length === cards.length && cards.length > 0}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Выбрать все</span>
              </label>
            </div>
          </div>
          
          {cards.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💳</div>
              <p className="text-gray-600">Нет доступных карт</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Выбор</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Карта</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Тип</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Банк</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Статус</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Назначения</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Статистика</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => (
                    <tr key={card.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedCards.includes(card.id)}
                          onChange={() => handleSelectCard(card.id)}
                          className="mr-2"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm">
                          <div className="text-gray-900">{card.card_number}</div>
                          <div className="text-gray-500">{card.expiry_date} | {card.cvv}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getCardTypeColor(card.card_type)} text-white`}>
                          {getCardTypeIcon(card.card_type)} {card.card_type === 'pink' ? 'Розовая' : 'Серая'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">{card.bank_accounts?.banks?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{card.bank_accounts?.banks?.country || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(card.status)}`}>
                          {getStatusBadgeText(card.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {card.assigned_employee_id ? (
                            <div>
                              <div className="text-gray-900">ID: {card.assigned_employee_id}</div>
                              {card.assigned_casino_id && (
                                <div className="text-gray-500">Казино: {card.assigned_casino_id}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Не назначена</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="text-gray-900">Депозит: {card.deposit_amount || 0}</div>
                          <div className="text-gray-500">Вывод: {card.withdrawal_amount || 0}</div>
                          <div className="text-green-600 font-semibold">Прибыль: {card.profit || 0}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Назначить карты</h2>
              
              <form onSubmit={handleMassAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    👤 Сотрудник
                  </label>
                  <select
                    required
                    value={assignmentData.employeeId}
                    onChange={(e) => setAssignmentData({...assignmentData, employeeId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите сотрудника</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} ({employee.username})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🌐 Тестовый сайт
                  </label>
                  <select
                    required
                    value={assignmentData.siteId}
                    onChange={(e) => setAssignmentData({...assignmentData, siteId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите сайт</option>
                    {testSites.filter(site => site.status === 'active').map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.casino_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Информация:</strong> Будет назначено {selectedCards.length} карт выбранному сотруднику на указанный сайт.
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => setShowAssignmentModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl"
                  >
                    Назначить
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
