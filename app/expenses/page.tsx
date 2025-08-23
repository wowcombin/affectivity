'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/components/Button'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Expense {
  id: string
  description: string
  amount_usd: number
  month: string
  category: string
  added_by: string
  created_at: string
  users: {
    username: string
    full_name: string
  }
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount_usd: '',
    category: 'office',
    month: new Date().toISOString().slice(0, 7)
  })

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses)
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
      toast.error('Ошибка загрузки расходов')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount_usd: parseFloat(formData.amount_usd)
        }),
      })

      if (response.ok) {
        toast.success('Расход успешно добавлен!')
        setShowAddForm(false)
        setFormData({
          description: '',
          amount_usd: '',
          category: 'office',
          month: new Date().toISOString().slice(0, 7)
        })
        loadExpenses()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка добавления расхода')
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Ошибка добавления расхода')
    }
  }

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount_usd, 0)
  }

  const getExpensesByCategory = () => {
    const categories = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount_usd
      return acc
    }, {} as Record<string, number>)
    return categories
  }

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
              Управление расходами
            </h1>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + Добавить расход
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Общие расходы</h3>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(getTotalExpenses())}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Расходов в этом месяце</h3>
            <p className="text-3xl font-bold text-blue-600">
              {expenses.filter(e => e.month === new Date().toISOString().slice(0, 7)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Категорий</h3>
            <p className="text-3xl font-bold text-green-600">
              {Object.keys(getExpensesByCategory()).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Средний расход</h3>
            <p className="text-3xl font-bold text-purple-600">
              {expenses.length > 0 ? formatCurrency(getTotalExpenses() / expenses.length) : '$0'}
            </p>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Расходы по категориям</h3>
            <div className="space-y-3">
              {Object.entries(getExpensesByCategory()).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category === 'office' ? 'Офисные' : 
                     category === 'marketing' ? 'Маркетинг' : 
                     category === 'servers' ? 'Серверы' : category}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Расходы по месяцам</h3>
            <div className="space-y-3">
              {Array.from(new Set(expenses.map(e => e.month))).sort().reverse().slice(0, 6).map(month => {
                const monthExpenses = expenses.filter(e => e.month === month)
                const total = monthExpenses.reduce((sum, e) => sum + e.amount_usd, 0)
                return (
                  <div key={month} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Список расходов</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Месяц
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Добавил
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {expense.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600">
                        {formatCurrency(expense.amount_usd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {expense.category === 'office' ? 'Офисные' : 
                         expense.category === 'marketing' ? 'Маркетинг' : 
                         expense.category === 'servers' ? 'Серверы' : expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.users?.full_name || expense.users?.username || 'Система'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Добавить новый расход
              </h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Описание
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Например: Офисные расходы"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Сумма (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount_usd}
                    onChange={(e) => setFormData({...formData, amount_usd: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Категория
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="office">Офисные расходы</option>
                    <option value="marketing">Маркетинг</option>
                    <option value="servers">Серверы и хостинг</option>
                    <option value="software">Программное обеспечение</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Месяц
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">
                    Добавить
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
