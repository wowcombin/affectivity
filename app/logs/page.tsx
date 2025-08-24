'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/app/components/Navigation'
import SearchFilter from '@/app/components/SearchFilter'
import ExportData from '@/app/components/ExportData'
import Pagination from '@/app/components/Pagination'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Log {
  id: string
  user_id: string
  action: string
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
  users: {
    username: string
    full_name: string
    role: string
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalItems, setTotalItems] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Получаем роль пользователя
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
      
      // Только Admin может видеть эту страницу
      if (user.role !== 'Admin') {
        router.push('/dashboard')
        return
      }
    }
    loadLogs()
  }, [currentPage, itemsPerPage])

  const loadLogs = async (searchQuery = '', filters = {}) => {
    try {
      const authToken = localStorage.getItem('auth-token')
      if (!authToken) {
        router.push('/login')
        return
      }

      let url = `/api/logs?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`
        }
      })

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      console.log('Logs response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setTotalItems(data.total || data.logs?.length || 0)
      } else {
        console.error('Failed to load logs')
        toast.error('Ошибка загрузки логов')
      }
    } catch (error) {
      console.error('Logs error:', error)
      toast.error('Ошибка загрузки логов')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setCurrentPage(1)
    loadLogs(query)
  }

  const handleFilter = (filters: any) => {
    setCurrentPage(1)
    loadLogs('', filters)
  }

  const handleExport = (format: string, data: any[]) => {
    toast.success(`Логи экспортированы в формате ${format.toUpperCase()}`)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return '🔐'
      case 'logout': return '🚪'
      case 'create': return '➕'
      case 'update': return '✏️'
      case 'delete': return '🗑️'
      case 'view': return '👁️'
      case 'export': return '📤'
      case 'import': return '📥'
      default: return '📝'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login': return 'from-green-500 to-green-600'
      case 'logout': return 'from-gray-500 to-gray-600'
      case 'create': return 'from-blue-500 to-blue-600'
      case 'update': return 'from-yellow-500 to-yellow-600'
      case 'delete': return 'from-red-500 to-red-600'
      case 'view': return 'from-purple-500 to-purple-600'
      case 'export': return 'from-emerald-500 to-emerald-600'
      case 'import': return 'from-indigo-500 to-indigo-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'from-red-500 to-red-600'
      case 'CFO': return 'from-purple-500 to-purple-600'
      case 'Manager': return 'from-blue-500 to-blue-600'
      case 'Employee': return 'from-green-500 to-green-600'
      case 'Tester': return 'from-yellow-500 to-yellow-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  if (userRole !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Navigation userRole={userRole} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h3>
            <p className="text-gray-600">Только администраторы могут просматривать эту страницу</p>
          </div>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navigation userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <span className="mr-3">📋</span>
            Журнал активности
          </h1>
          <p className="text-blue-200">Отслеживание всех действий пользователей в системе</p>
        </div>

        {/* Search and Filters */}
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          placeholder="Поиск по действиям, пользователям..."
          filters={[
            {
              key: 'action',
              label: 'Действие',
              options: [
                { value: 'login', label: '🔐 Вход' },
                { value: 'logout', label: '🚪 Выход' },
                { value: 'create', label: '➕ Создание' },
                { value: 'update', label: '✏️ Обновление' },
                { value: 'delete', label: '🗑️ Удаление' },
                { value: 'view', label: '👁️ Просмотр' },
                { value: 'export', label: '📤 Экспорт' },
                { value: 'import', label: '📥 Импорт' }
              ]
            },
            {
              key: 'user_id',
              label: 'Пользователь',
              options: [] // Будет заполнено динамически
            }
          ]}
        />

        {/* Export Controls */}
        <div className="mb-8 flex justify-end">
          <ExportData
            data={logs}
            filename="activity-logs"
            onExport={handleExport}
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка логов...</p>
          </div>
        )}

        {/* Logs List */}
        {!isLoading && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-gray-50 to-blue-50">
              <h2 className="text-lg font-bold text-gray-900">📋 Список действий</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      👤 Пользователь
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      📝 Действие
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      📄 Детали
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      🌐 IP адрес
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      📅 Дата
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-white/20">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                              <span className="text-lg">👤</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">
                              {log.users.full_name || log.users.username}
                            </div>
                            <div className="text-sm text-gray-600">
                              @{log.users.username}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getRoleColor(log.users.role)} text-white shadow-lg`}>
                              {log.users.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getActionColor(log.action)} text-white shadow-lg`}>
                          {getActionIcon(log.action)} {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {log.details ? (
                            <details className="cursor-pointer">
                              <summary className="hover:text-blue-600">Показать детали</summary>
                              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-gray-500">Нет деталей</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {log.ip_address || 'Неизвестно'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        📅 {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}

        {/* No Data */}
        {!isLoading && logs.length === 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Нет данных</h3>
            <p className="text-gray-600">Логи активности не найдены</p>
          </div>
        )}
      </div>
    </div>
  )
}
