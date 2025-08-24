'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Employee {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  salary: number
  hire_date: string
  is_active: boolean
  bank_name: string
  bank_country: string
  account_number: string
  sort_code: string
  card_number: string
  card_expiry: string
  card_cvv: string
  login_url: string
  login_username: string
  login_password: string
  created_at: string
  updated_at: string
  user: {
    username: string
    role: string
    is_active: boolean
  }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: ''
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
      loadEmployees()
    } else {
      router.push('/login')
    }
  }, [])

  const loadEmployees = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
      } else {
        console.error('Failed to load employees')
        toast.error('Ошибка загрузки сотрудников')
      }
    } catch (error) {
      console.error('Employees error:', error)
      toast.error('Ошибка загрузки сотрудников')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Сотрудник успешно добавлен!')
        setShowCreateForm(false)
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          username: '',
          password: ''
        })
        loadEmployees()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка добавления сотрудника')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Ошибка добавления сотрудника')
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingEmployee) return
    
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Сотрудник успешно обновлен!')
        setShowEditForm(false)
        setEditingEmployee(null)
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          username: '',
          password: ''
        })
        loadEmployees()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка обновления сотрудника')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('Ошибка обновления сотрудника')
    }
  }

  const handleDelete = async (employeeId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника? Это действие нельзя отменить.')) {
      return
    }
    
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        toast.success('Сотрудник успешно удален!')
        loadEmployees()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка удаления сотрудника')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Ошибка удаления сотрудника')
    }
  }

  const handleFire = async (employeeId: string) => {
    if (!confirm('Вы уверены, что хотите уволить этого сотрудника?')) {
      return
    }
    
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch(`/api/employees/${employeeId}/fire`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        toast.success('Сотрудник успешно уволен!')
        loadEmployees()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка увольнения сотрудника')
      }
    } catch (error) {
      console.error('Fire error:', error)
      toast.error('Ошибка увольнения сотрудника')
    }
  }

  const openEditForm = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      username: '',
      password: ''
    })
    setShowEditForm(true)
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? '✅' : '❌'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'from-red-500 to-red-600'
      case 'CFO': return 'from-purple-500 to-purple-600'
      case 'Manager': return 'from-blue-500 to-blue-600'
      case 'HR': return 'from-pink-500 to-pink-600'
      case 'Tester': return 'from-yellow-500 to-yellow-600'
      case 'Employee': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return '👑'
      case 'CFO': return '💰'
      case 'Manager': return '👔'
      case 'HR': return '👥'
      case 'Tester': return '🧪'
      case 'Employee': return '👷'
      default: return '❓'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка сотрудников...</p>
        </div>
      </div>
    )
  }

  if (!['Admin', 'HR', 'Manager'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Navigation userRole={userRole} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h3>
            <p className="text-gray-600">Только администраторы, HR и менеджеры могут просматривать сотрудников</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Сотрудники</h1>
              <p className="text-gray-600">Управление персоналом компании</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              ➕ Добавить сотрудника
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <p className="text-sm text-gray-600">Всего сотрудников</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <p className="text-sm text-gray-600">Активных</p>
                <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.is_active).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💰</div>
              <div>
                <p className="text-sm text-gray-600">Общий фонд ЗП</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(employees.reduce((sum, e) => sum + e.salary, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📅</div>
              <div>
                <p className="text-sm text-gray-600">Новых в этом месяце</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(e => {
                    const hireDate = new Date(e.hire_date)
                    const now = new Date()
                    return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employees List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Список сотрудников</h2>
          
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-600">Нет добавленных сотрудников</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Сотрудник</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Роль</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Банковские аккаунты</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Карта</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Данные входа</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Зарплата</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Статус</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                          <div className="text-xs text-gray-400">{employee.position}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getRoleColor(employee.user.role)} text-white`}>
                          {getRoleIcon(employee.user.role)} {employee.user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">{employee.bank_name}</div>
                          <div className="text-sm text-gray-500">{employee.bank_country}</div>
                          <div className="text-xs text-gray-400">Счет: {employee.account_number}</div>
                          <div className="text-xs text-gray-400">Сорт: {employee.sort_code}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm">
                          <div className="text-gray-900">{employee.card_number}</div>
                          <div className="text-gray-500">{employee.card_expiry} | {employee.card_cvv}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm text-gray-900">
                            <a href={employee.login_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              🔗 {employee.login_url}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500">Логин: {employee.login_username}</div>
                          <div className="text-xs text-gray-500">Пароль: {employee.login_password}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(employee.salary)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(employee.is_active)} text-white`}>
                          {getStatusIcon(employee.is_active)} {employee.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditForm(employee)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                          >
                            ✏️ Редактировать
                          </button>
                          {employee.is_active && ['HR', 'Manager'].includes(userRole) && (
                            <button
                              onClick={() => handleFire(employee.id)}
                              className="text-orange-600 hover:text-orange-800 text-sm font-semibold"
                            >
                              🔥 Уволить
                            </button>
                          )}
                          {userRole === 'Admin' && (
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-semibold"
                            >
                              🗑️ Удалить
                            </button>
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

      {/* Create Employee Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Добавить нового сотрудника</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Имя
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Фамилия
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📧 Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Username
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔑 Пароль
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите пароль"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    ✅ Добавить
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditForm && editingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">✏️ Редактировать сотрудника</h2>
              
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Имя
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Фамилия
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📧 Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingEmployee(null)
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    ✅ Сохранить
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
