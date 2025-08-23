'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/Button'

interface Employee {
  id: string
  username: string
  full_name: string
  role: string
  email: string
  is_active: boolean
}

interface EmployeeSelectorProps {
  onEmployeeSelect: (employee: Employee | null) => void
  selectedEmployee: Employee | null
  userRole: string
}

export default function EmployeeSelector({ onEmployeeSelect, selectedEmployee, userRole }: EmployeeSelectorProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    loadEmployees()
  }, [])

  // Закрываем выпадающее меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.employee-selector')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const loadEmployees = async () => {
    try {
      // Пока используем моковые данные
      const mockEmployees: Employee[] = [
        {
          id: '1',
          username: 'john_doe',
          full_name: 'John Doe',
          role: 'Manager',
          email: 'john@example.com',
          is_active: true
        },
        {
          id: '2',
          username: 'jane_smith',
          full_name: 'Jane Smith',
          role: 'HR',
          email: 'jane@example.com',
          is_active: true
        },
        {
          id: '3',
          username: 'mike_wilson',
          full_name: 'Mike Wilson',
          role: 'CFO',
          email: 'mike@example.com',
          is_active: true
        },
        {
          id: '4',
          username: 'sarah_tester',
          full_name: 'Sarah Tester',
          role: 'Tester',
          email: 'sarah@example.com',
          is_active: true
        },
        {
          id: '5',
          username: 'ceo_manager',
          full_name: 'CEO Manager',
          role: 'CEO',
          email: 'ceo@example.com',
          is_active: true
        }
      ]
      setEmployees(mockEmployees)
    } catch (error) {
      console.error('Error loading employees:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredEmployees = () => {
    if (filterRole === 'all') return employees
    return employees.filter(emp => emp.role === filterRole)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'HR': return '👥'
      case 'Manager': return '👨‍💼'
      case 'CFO': return '💰'
      case 'CEO': return '👑'
      case 'Tester': return '🧪'
      case 'Employee': return '👤'
      case 'Admin': return '⚡'
      default: return '👤'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'HR': return 'from-blue-500 to-blue-600'
      case 'Manager': return 'from-green-500 to-green-600'
      case 'CFO': return 'from-purple-500 to-purple-600'
      case 'CEO': return 'from-yellow-500 to-orange-500'
      case 'Tester': return 'from-pink-500 to-pink-600'
      case 'Employee': return 'from-gray-500 to-gray-600'
      case 'Admin': return 'from-red-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const canViewAllEmployees = ['Admin', 'HR', 'Manager'].includes(userRole)

  if (!canViewAllEmployees) {
    return null
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <span className="mr-2">👥</span>
          Выбор сотрудника для отчетов
        </h3>
        <div className="flex items-center space-x-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
          >
            <option value="all">Все роли</option>
            <option value="HR">👥 HR</option>
            <option value="Manager">👨‍💼 Manager</option>
            <option value="CFO">💰 CFO</option>
            <option value="CEO">👑 CEO</option>
            <option value="Tester">🧪 Tester</option>
            <option value="Employee">👤 Employee</option>
            <option value="Admin">⚡ Admin</option>
          </select>
        </div>
      </div>

      <div className="relative employee-selector">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-left flex items-center justify-between"
        >
          <div className="flex items-center">
            {selectedEmployee ? (
              <>
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${getRoleColor(selectedEmployee.role)} flex items-center justify-center shadow-lg mr-3`}>
                  <span className="text-white font-bold text-sm">
                    {selectedEmployee.full_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedEmployee.full_name}</div>
                  <div className="text-sm text-gray-600">@{selectedEmployee.username} • {selectedEmployee.role}</div>
                </div>
              </>
            ) : (
              <span className="text-gray-500">Выберите сотрудника для просмотра отчетов...</span>
            )}
          </div>
          <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 z-[99999] max-h-64 overflow-y-auto" style={{ position: 'fixed', zIndex: 99999 }}>
            <div className="py-2">
              {getFilteredEmployees().map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => {
                    onEmployeeSelect(employee)
                    setShowDropdown(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-all duration-300 flex items-center"
                >
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-r ${getRoleColor(employee.role)} flex items-center justify-center shadow-lg mr-3`}>
                    <span className="text-white font-bold">
                      {employee.full_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{employee.full_name}</div>
                    <div className="text-sm text-gray-600">@{employee.username}</div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">{getRoleIcon(employee.role)}</span>
                    <span className="text-sm font-medium text-gray-700">{employee.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Отчеты для {selectedEmployee.full_name}</h4>
              <p className="text-sm text-gray-600">
                Роль: {selectedEmployee.role} • Email: {selectedEmployee.email}
              </p>
            </div>
            <Button
              onClick={() => onEmployeeSelect(null)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-all duration-300"
            >
              Очистить
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
