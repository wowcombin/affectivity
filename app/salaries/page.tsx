'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface SalaryCalculation {
  id: string
  month: string
  total_profit: number
  total_expenses: number
  net_profit: number
  total_salary_fund: number
  employee_count: number
  average_salary: number
  calculated_by: string
  created_at: string
  users: {
    username: string
    full_name: string
  }
}

interface Salary {
  id: string
  employee_id: string
  month: string
  base_salary: number
  bonus: number
  total_salary: number
  status: string
  paid_at: string | null
  created_at: string
  employees: {
    users: {
      username: string
      full_name: string
      role: string
    }
  }
}

export default function SalariesPage() {
  const [calculations, setCalculations] = useState<SalaryCalculation[]>([])
  const [currentSalaries, setCurrentSalaries] = useState<Salary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Получаем роль пользователя
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Загружаем историю расчетов
      const calcResponse = await fetch('/api/salaries/calculate')
      if (calcResponse.ok) {
        const calcData = await calcResponse.json()
        setCalculations(calcData.calculations || [])
      }

      // Загружаем текущие зарплаты
      const salariesResponse = await fetch('/api/salaries')
      if (salariesResponse.ok) {
        const salariesData = await salariesResponse.json()
        setCurrentSalaries(salariesData.salaries || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculateSalaries = async () => {
    setIsCalculating(true)
    try {
      const response = await fetch('/api/salaries/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Зарплаты успешно рассчитаны!')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка расчета зарплат')
      }
    } catch (error) {
      console.error('Error calculating salaries:', error)
      toast.error('Ошибка расчета зарплат')
    } finally {
      setIsCalculating(false)
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

  const getTotalSalaryFund = () => {
    return currentSalaries.reduce((sum, s) => sum + s.total_salary, 0)
  }

  const getPaidSalaries = () => {
    return currentSalaries.filter(s => s.status === 'paid').length
  }

  const getPendingSalaries = () => {
    return currentSalaries.filter(s => s.status === 'pending').length
  }

  const getAverageSalary = () => {
    return currentSalaries.length > 0 ? getTotalSalaryFund() / currentSalaries.length : 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка зарплат...</p>
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
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Общий фонд</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(getTotalSalaryFund())}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Сотрудников</h3>
                <p className="text-3xl font-bold text-blue-600">{currentSalaries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Средняя зарплата</h3>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(getAverageSalary())}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">К выплате</h3>
                <p className="text-3xl font-bold text-orange-600">{getPendingSalaries()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-2">🧮</span>
                Расчет зарплат
              </h3>
              <p className="text-gray-600">Автоматический расчет зарплат на основе прибыли и расходов</p>
            </div>
            <Button
              onClick={handleCalculateSalaries}
              disabled={isCalculating}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Расчет...
                </>
              ) : (
                '🧮 Рассчитать зарплаты'
              )}
            </Button>
          </div>
        </div>

        {/* Current Month Salaries */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-lg font-bold text-gray-900">💳 Зарплаты за текущий месяц</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👤 Сотрудник
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    🏷️ Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💰 Базовая зарплата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    🎁 Бонус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💳 Итого
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📊 Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-white/20">
                {currentSalaries.map((salary) => (
                  <tr key={salary.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              {salary.employees.users.full_name?.charAt(0) || salary.employees.users.username.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {salary.employees.users.full_name || salary.employees.users.username}
                          </div>
                          <div className="text-sm text-gray-600">
                            @{salary.employees.users.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                        {salary.employees.users.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 bg-white/70 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(salary.base_salary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg inline-block">
                        +{formatCurrency(salary.bonus)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(salary.total_salary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        salary.status === 'paid' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                      }`}>
                        {salary.status === 'paid' ? '✅ Выплачено' : '⏳ Ожидает выплаты'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation History */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-lg font-bold text-gray-900">📊 История расчетов</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📅 Месяц
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💰 Общая прибыль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💸 Расходы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📈 Чистая прибыль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💳 Фонд зарплат
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👤 Сотрудников
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📊 Средняя зарплата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👨‍💼 Рассчитал
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-white/20">
                {calculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        📅 {new Date(calc.month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(calc.total_profit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(calc.total_expenses)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(calc.net_profit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(calc.total_salary_fund)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 bg-white/70 px-3 py-1 rounded-lg inline-block">
                        {calc.employee_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(calc.average_salary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        👨‍💼 {calc.users?.full_name || calc.users?.username || 'Система'}
                      </div>
                      <div className="text-sm text-gray-500">
                        📅 {formatDate(calc.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
