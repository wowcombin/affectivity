'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface SalaryCalculation {
  id: string
  employee_id: string
  employee_name: string
  employee_role: string
  month: string
  year: number
  base_salary: number
  gross_amount: number
  bonus_amount: number
  leader_bonus: number
  total_salary: number
  currency: string
  usd_rate: number
  usd_amount: number
  status: 'pending' | 'calculated' | 'paid'
  calculated_at: string
  paid_at?: string
}

interface Employee {
  id: string
  first_name: string
  last_name: string
  username: string
  role: string
  salary: number
}

export default function SalariesPage() {
  const [salaryCalculations, setSalaryCalculations] = useState<SalaryCalculation[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showCalculationModal, setShowCalculationModal] = useState(false)
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
  }, [selectedMonth])

  const loadData = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      
      // Загружаем расчеты зарплат
      const salariesResponse = await fetch(`/api/salaries?month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (salariesResponse.ok) {
        const salariesData = await salariesResponse.json()
        setSalaryCalculations(salariesData.calculations || [])
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

    } catch (error) {
      console.error('Load data error:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculateSalaries = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/salaries/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          month: selectedMonth
        })
      })

      if (response.ok) {
        toast.success('Зарплаты успешно рассчитаны!')
        setShowCalculationModal(false)
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка расчета зарплат')
      }
    } catch (error) {
      console.error('Calculation error:', error)
      toast.error('Ошибка расчета зарплат')
    }
  }

  const handlePaySalaries = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/salaries/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          month: selectedMonth
        })
      })

      if (response.ok) {
        toast.success('Зарплаты успешно выплачены!')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка выплаты зарплат')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Ошибка выплаты зарплат')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'from-yellow-500 to-yellow-600'
      case 'calculated': return 'from-blue-500 to-blue-600'
      case 'paid': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'calculated': return '📊'
      case 'paid': return '✅'
      default: return '❓'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает расчета'
      case 'calculated': return 'Рассчитано'
      case 'paid': return 'Выплачено'
      default: return 'Неизвестно'
    }
  }

  const getTotalAmount = () => {
    return salaryCalculations.reduce((sum, calc) => sum + calc.total_salary, 0)
  }

  const getTotalUSD = () => {
    return salaryCalculations.reduce((sum, calc) => sum + calc.usd_amount, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка зарплат...</p>
        </div>
      </div>
    )
  }

  if (!['Admin', 'CFO', 'HR'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Navigation userRole={userRole} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h3>
            <p className="text-gray-600">Только администраторы, CFO и HR могут управлять зарплатами</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">💵 Управление зарплатами</h1>
              <p className="text-gray-600">Расчет и выплата зарплат сотрудников</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date()
                  date.setMonth(date.getMonth() - i)
                  const monthStr = date.toISOString().slice(0, 7)
                  return (
                    <option key={monthStr} value={monthStr}>
                      {new Date(monthStr + '-01').toLocaleDateString('ru-RU', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </option>
                  )
                })}
              </select>
              <Button
                onClick={() => setShowCalculationModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🧮 Рассчитать зарплаты
              </Button>
              {salaryCalculations.some(calc => calc.status === 'calculated') && (
                <Button
                  onClick={handlePaySalaries}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  💰 Выплатить зарплаты
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <p className="text-sm text-gray-600">Сотрудников</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💵</div>
              <div>
                <p className="text-sm text-gray-600">Общий фонд</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalAmount())}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💲</div>
              <div>
                <p className="text-sm text-gray-600">В USD</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalUSD().toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <p className="text-sm text-gray-600">Рассчитано</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salaryCalculations.filter(calc => calc.status === 'calculated').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Calculations List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Расчеты зарплат</h2>
          
          {salaryCalculations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💵</div>
              <p className="text-gray-600">Нет расчетов зарплат за выбранный месяц</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Сотрудник</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Роль</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Базовая ЗП</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Брутто</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Бонус</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Лидер бонус</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Итого</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">USD</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Статус</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryCalculations.map((calculation) => (
                    <tr key={calculation.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">{calculation.employee_name}</div>
                          <div className="text-sm text-gray-500">{calculation.employee_role}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {calculation.employee_role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900 font-semibold">
                          {formatCurrency(calculation.base_salary)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-blue-600 font-semibold">
                          {formatCurrency(calculation.gross_amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(calculation.bonus_amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-purple-600 font-semibold">
                          {formatCurrency(calculation.leader_bonus)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-bold text-lg">
                          {formatCurrency(calculation.total_salary)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-blue-600 font-semibold">
                          ${calculation.usd_amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(calculation.status)} text-white`}>
                          {getStatusIcon(calculation.status)} {getStatusText(calculation.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          <div>Рассчитано: {formatDate(calculation.calculated_at)}</div>
                          {calculation.paid_at && (
                            <div>Выплачено: {formatDate(calculation.paid_at)}</div>
                          )}
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

      {/* Calculation Modal */}
      {showCalculationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🧮 Расчет зарплат</h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Формулы расчета:</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><strong>Сотрудники:</strong> 10% от брутто + $200 (если брутто > $200)</div>
                    <div><strong>Менеджеры:</strong> 10% от общего брутто</div>
                    <div><strong>Лидер месяца:</strong> +10% от максимальной транзакции</div>
                    <div><strong>Курс USD:</strong> Google курс -5%</div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Внимание:</strong> Расчет будет произведен для всех сотрудников за {new Date(selectedMonth + '-01').toLocaleDateString('ru-RU', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}.
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => setShowCalculationModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleCalculateSalaries}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl"
                  >
                    Рассчитать
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
