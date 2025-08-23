'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import { toast } from 'sonner'

interface User {
  id: string
  username: string
  full_name: string | null
  role: string
  email: string
  usdt_address: string | null
  usdt_network: string | null
}

interface DashboardStats {
  total_employees: number
  active_employees: number
  total_profit: number
  monthly_profit: number
  pending_salaries: number
  total_expenses: number
  expense_percentage: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('auth-token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      setUser(user)
      loadDashboardStats()
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router])

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/salaries/calculate')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user')
      router.push('/login')
      toast.success('Вы успешно вышли из системы')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Ошибка при выходе из системы')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'Admin':
        return <AdminDashboard user={user} stats={stats} />
      case 'Manager':
        return <ManagerDashboard user={user} stats={stats} />
      case 'HR':
        return <HRDashboard user={user} stats={stats} />
      case 'CFO':
        return <CFODashboard user={user} stats={stats} />
      case 'Employee':
      case 'Tester':
        return <EmployeeDashboard user={user} stats={stats} />
      default:
        return <DefaultDashboard user={user} stats={stats} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Affectivity Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user.full_name || user.username}</span>
                <span className="mx-2">•</span>
                <span className="text-gray-500">{user.role}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
    </div>
  )
}

// Компоненты дашбордов для разных ролей
function AdminDashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          👑 Админ панель
        </h2>
        <p className="text-gray-600 mb-6">
          Добро пожаловать в систему управления сотрудниками, {user.full_name || user.username}!
        </p>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Всего сотрудников"
              value={stats.total_employees}
              icon="👥"
            />
            <StatCard
              title="Активных"
              value={stats.active_employees}
              icon="✅"
            />
            <StatCard
              title="Общий профит"
              value={formatCurrency(stats.total_profit)}
              icon="💰"
            />
            <StatCard
              title="Расходы"
              value={formatCurrency(stats.total_expenses)}
              subtitle={`${formatPercentage(stats.expense_percentage)} от профита`}
              icon="📊"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ManagerDashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🎯 Manager Dashboard
        </h2>
        <p className="text-gray-600 mb-6">
          Управление командой и мониторинг производительности
        </p>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Мой заработок"
              value={formatCurrency(stats.total_profit * 0.10)}
              subtitle="10% от общего профита"
              icon="💼"
            />
            <StatCard
              title="Активных сотрудников"
              value={stats.active_employees}
              icon="👥"
            />
            <StatCard
              title="Выполнено транзакций"
              value="1,666"
              icon="📈"
            />
            <StatCard
              title="Средний профит/сотрудник"
              value={formatCurrency(stats.total_profit / Math.max(stats.active_employees, 1))}
              icon="📊"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function HRDashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          👥 HR Dashboard
        </h2>
        <p className="text-gray-600 mb-6">
          Управление персоналом и кадровые процессы
        </p>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Мой заработок"
              value={formatCurrency(stats.total_profit * 0.05)}
              subtitle="5% от общего профита"
              icon="💰"
            />
            <StatCard
              title="Активных сотрудников"
              value={stats.active_employees}
              icon="👥"
            />
            <StatCard
              title="Новых за месяц"
              value="3"
              icon="🆕"
            />
            <StatCard
              title="Подписанных NDA"
              value="18/18"
              icon="📄"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function CFODashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          💼 CFO Dashboard
        </h2>
        <p className="text-gray-600 mb-6">
          Финансовый контроль и управление расходами
        </p>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Мой заработок"
              value={formatCurrency(stats.total_profit * 0.05)}
              subtitle="5% от общего профита"
              icon="💰"
            />
            <StatCard
              title="Общий профит"
              value={formatCurrency(stats.total_profit)}
              icon="📈"
            />
            <StatCard
              title="К выплате"
              value={formatCurrency(stats.total_profit * 0.3)}
              icon="💳"
            />
            <StatCard
              title="Расходы"
              value={formatCurrency(stats.total_expenses)}
              subtitle={`${formatPercentage(stats.expense_percentage)} от брутто`}
              icon="📊"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function EmployeeDashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          👤 Мой профиль
        </h2>
        <p className="text-gray-600 mb-6">
          Личная статистика и управление профилем
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Мой профит"
            value={formatCurrency(238.46)}
            icon="💰"
          />
          <StatCard
            title="Транзакции"
            value="156"
            icon="📊"
          />
          <StatCard
            title="Зарплата"
            value={formatCurrency(238.46)}
            icon="💳"
          />
          <StatCard
            title="Бонусы"
            value={formatCurrency(200)}
            icon="🎁"
          />
        </div>
      </div>
    </div>
  )
}

function DefaultDashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Добро пожаловать, {user.full_name || user.username}!
      </h2>
      <p className="text-gray-600">
        Ваша роль: {user.role}
      </p>
    </div>
  )
}

// Компонент карточки статистики
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: string; 
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}
