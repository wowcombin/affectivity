'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/components/Button'
import { formatDate, formatCurrency, formatPercentage } from '@/lib/utils'
import { toast } from 'sonner'

interface SalaryCalculation {
  month: string
  gross_profit: number
  total_expenses: number
  expense_percentage: number
  net_profit: number
  calculation_base: 'gross' | 'net'
  created_at: string
}

interface Salary {
  id: string
  employee_id: string
  month: string
  base_salary: number
  performance_bonus: number
  leader_bonus: number
  total_salary: number
  is_paid: boolean
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
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Загружаем расчеты зарплат
      const calcResponse = await fetch('/api/salaries/calculate')
      if (calcResponse.ok) {
        const calcData = await calcResponse.json()
        setCalculations(calcData.calculations || [])
      }

      // Загружаем зарплаты сотрудников
      const salariesResponse = await fetch(`/api/salaries?month=${selectedMonth}`)
      if (salariesResponse.ok) {
        const salariesData = await salariesResponse.json()
        setSalaries(salariesData.salaries || [])
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
        body: JSON.stringify({ month: selectedMonth }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Зарплаты за ${selectedMonth} успешно рассчитаны!`)
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

  const getTotalSalaries = () => {
    return salaries.reduce((sum, salary) => sum + salary.total_salary, 0)
  }

  const getUnpaidSalaries = () => {
    return salaries.filter(s => !s.is_paid).reduce((sum, salary) => sum + salary.total_salary, 0)
  }

  const currentCalculation = calculations.find(c => c.month === selectedMonth)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Расчет зарплат
            </h1>
            <div className="flex items-center space-x-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                onClick={handleCalculateSalaries}
                disabled={isCalculating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCalculating ? 'Расчет...' : 'Рассчитать зарплаты'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Общий фонд зарплат</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(getTotalSalaries())}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">К выплате</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(getUnpaidSalaries())}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Сотрудников</h3>
            <p className="text-3xl font-bold text-purple-600">{salaries.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Средняя зарплата</h3>
            <p className="text-3xl font-bold text-orange-600">
              {salaries.length > 0 ? formatCurrency(getTotalSalaries() / salaries.length) : '$0'}
            </p>
          </div>
        </div>

        {/* Calculation Summary */}
        {currentCalculation && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Сводка расчета за {new Date(selectedMonth + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Брутто профит</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(currentCalculation.gross_profit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Расходы</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(currentCalculation.total_expenses)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Нетто профит</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(currentCalculation.net_profit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">База расчета</p>
                <p className="text-xl font-bold text-purple-600 capitalize">
                  {currentCalculation.calculation_base === 'gross' ? 'Брутто' : 'Нетто'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Процент расходов: <span className="font-semibold">{formatPercentage(currentCalculation.expense_percentage)}</span>
                {currentCalculation.expense_percentage > 20 && (
                  <span className="ml-2 text-orange-600">(Расчет от нетто профита)</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Salaries List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Зарплаты сотрудников</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сотрудник
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Базовая зарплата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Бонус за производительность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Бонус лидера
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Итого
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaries.map((salary) => (
                  <tr key={salary.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {salary.employees.users.full_name?.charAt(0) || salary.employees.users.username.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {salary.employees.users.full_name || 'Не указано'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {salary.employees.users.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {salary.employees.users.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(salary.base_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(salary.performance_bonus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(salary.leader_bonus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(salary.total_salary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        salary.is_paid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {salary.is_paid ? 'Выплачено' : 'К выплате'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation History */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">История расчетов</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Месяц
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Брутто профит
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Расходы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Нетто профит
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    База расчета
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата расчета
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculations.map((calculation) => (
                  <tr key={calculation.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(calculation.month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(calculation.gross_profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(calculation.total_expenses)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(calculation.net_profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">
                        {calculation.calculation_base === 'gross' ? 'Брутто' : 'Нетто'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(calculation.created_at)}
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
