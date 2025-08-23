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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка расходов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-lg">💰</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Управление расходами
              </h1>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              ✨ + Добавить расход
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">💸</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Общие расходы</h3>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(getTotalExpenses())}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Расходов в этом месяце</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {expenses.filter(e => e.month === new Date().toISOString().slice(0, 7)).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">🏷️</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Категорий</h3>
                <p className="text-3xl font-bold text-green-600">
                  {Object.keys(getExpensesByCategory()).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Средний расход</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {expenses.length > 0 ? formatCurrency(getTotalExpenses() / expenses.length) : '$0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Расходы по категориям
            </h3>
            <div className="space-y-4">
              {Object.entries(getExpensesByCategory()).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                  <span className="text-sm font-semibold text-gray-700 capitalize">
                    {category === 'office' ? '🏢 Офисные' : 
                     category === 'marketing' ? '📢 Маркетинг' : 
                     category === 'servers' ? '🖥️ Серверы' : 
                     category === 'software' ? '💻 ПО' :
                     category === 'other' ? '📦 Другое' : category}
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-white/70 px-3 py-1 rounded-lg">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Расходы по месяцам
            </h3>
            <div className="space-y-4">
              {Array.from(new Set(expenses.map(e => e.month))).sort().reverse().slice(0, 6).map(month => {
                const monthExpenses = expenses.filter(e => e.month === month)
                const total = monthExpenses.reduce((sum, e) => sum + e.amount_usd, 0)
                return (
                  <div key={month} className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                    <span className="text-sm font-semibold text-gray-700">
                      📅 {new Date(month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-sm font-bold text-gray-900 bg-white/70 px-3 py-1 rounded-lg">
                      {formatCurrency(total)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-lg font-bold text-gray-900">💰 Список расходов</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📝 Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    💰 Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    🏷️ Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📅 Месяц
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👤 Добавил
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    📅 Дата
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-white/20">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {expense.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg inline-block">
                        {formatCurrency(expense.amount_usd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 capitalize">
                        {expense.category === 'office' ? '🏢 Офисные' : 
                         expense.category === 'marketing' ? '📢 Маркетинг' : 
                         expense.category === 'servers' ? '🖥️ Серверы' : 
                         expense.category === 'software' ? '💻 ПО' :
                         expense.category === 'other' ? '📦 Другое' : expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      📅 {new Date(expense.month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      👤 {expense.users?.full_name || expense.users?.username || 'Система'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      📅 {formatDate(expense.created_at)}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-md shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md">
            <div className="mt-3">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Добавить новый расход
                </h3>
                <p className="text-gray-600">Заполните информацию о расходе</p>
              </div>
              
              <form onSubmit={handleAddExpense} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Описание
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Например: Офисные расходы"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Сумма (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount_usd}
                    onChange={(e) => setFormData({...formData, amount_usd: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏷️ Категория
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="office">🏢 Офисные расходы</option>
                    <option value="marketing">📢 Маркетинг</option>
                    <option value="servers">🖥️ Серверы и хостинг</option>
                    <option value="software">💻 Программное обеспечение</option>
                    <option value="other">📦 Другое</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Месяц
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    ❌ Отмена
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ✨ Добавить
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
