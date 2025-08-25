'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import Navigation from '@/app/components/Navigation'

interface JuniorDashboardData {
  currentMonthProfit: number
  totalProfit: number
  monthlyLeaders: Array<{
    position: number
    username: string
    totalProfit: number
  }>
  topCasinos: Array<{
    position: number
    name: string
    totalProfit: number
  }>
  topAccounts: Array<{
    position: number
    casino: string
    username: string
    profit: number
  }>
  recentTransactions: Array<{
    id: string
    username: string
    casino: string
    profit: number
    timeToWithdrawal: string
    withdrawalDate: string
  }>
  timeToEndOfMonth: {
    days: number
    hours: number
    minutes: number
  }
}

export default function JuniorDashboard({ userId }: { userId: string }) {
  const [data, setData] = useState<JuniorDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/employee/dashboard', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Ошибка загрузки данных</p>
      </div>
    )
  }

  const getProgressBarWidth = (profit: number, max: number) => {
    return `${(profit / max) * 100}%`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation userRole="Employee" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Твоя прибыль за *текущий месяц* - *формула*$
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Лидеры текущего месяца */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">
                Лидеры *текущий месяц*
              </h3>
              <div className="space-y-3">
                {data.monthlyLeaders.map((leader) => (
                  <div key={leader.position} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-purple-600 mr-3">
                        {leader.position}.
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {leader.username}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">
                      ${leader.totalProfit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Топ казино текущего месяца */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Топ казино *текущий месяц*
              </h3>
              <div className="space-y-3">
                {data.topCasinos.map((casino) => (
                  <div key={casino.position} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-blue-600 mr-3">
                        {casino.position}.
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {casino.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      ${casino.totalProfit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Топ аккаунтов текущего месяца */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                Топ аккаунтов *текущий месяц*
              </h3>
              <div className="space-y-3">
                {data.topAccounts.map((account) => (
                  <div key={account.position} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-green-600 mr-3">
                        {account.position}.
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {account.casino}
                        </p>
                        <p className="text-xs text-gray-500">
                          {account.username}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      ${account.profit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Время до конца месяца */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">
                Время до конца месяца
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {data.timeToEndOfMonth.days}д
                </div>
                <div className="text-lg font-medium text-orange-500">
                  {data.timeToEndOfMonth.hours}ч {data.timeToEndOfMonth.minutes}м
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-gray-700">Общая прибыль</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${data.totalProfit}
                </p>
                <p className="text-xs text-gray-500">все команды за месяц</p>
              </div>
            </div>
          </div>
        </div>

        {/* Онлайн статистика транзакций */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Онлайн статистика транзакций
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Имя
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Казино
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Профит
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Затраченно время на аккаунт
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата вывода
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      *Username {transaction.username}*
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      *Name casino* {transaction.casino}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      *Brutto* ${transaction.profit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      *Time work* {transaction.timeToWithdrawal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      *Data Withdrawal* {transaction.withdrawalDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Лидеры текущего месяца */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Лидеры *текущий месяц*
            </h3>
            <p className="text-sm text-gray-600">
              *Username Junior* *totalprofit* - записывать топ 5 лучших сотрудников по итоговому профиту за месяц
            </p>
          </div>

          {/* Топ казино текущего месяца */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Топ казино *текущий месяц*
            </h3>
            <p className="text-sm text-gray-600">
              *Namecasino* *totalprofit* - записывать топ 5 лучших казино по подтвержденным выводам и итоговому профиту за месяц
            </p>
          </div>

          {/* Топ аккаунтов текущего месяца */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Топ аккаунтов *текущий месяц*
            </h3>
            <p className="text-sm text-gray-600">
              *Namecasino* *oneprofit* - записывать топ 5 лучших профитов по подтвержденным выводам по всем казино за месяц
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
