'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
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
      
      // Очищаем cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      router.push('/login')
      toast.success('Вы успешно вышли из системы')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Ошибка при выходе из системы')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка дашборда...</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation userRole={user.role} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-lg">🏠</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Главный дашборд
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="font-semibold">{user.full_name || user.username}</span>
                <span className="mx-2">•</span>
                <span className="text-purple-600 font-medium">{user.role}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white/50 hover:bg-white/70 backdrop-blur-sm border-white/20"
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              👑 Добро пожаловать, {user.full_name || user.username}!
            </h2>
            <p className="text-blue-100 text-lg">
              Управляйте всей системой Affectivity из единого центра
            </p>
          </div>
          <div className="text-6xl">👑</div>
        </div>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Всего сотрудников"
            value={stats.total_employees}
            icon="👥"
            gradient="from-blue-500 to-blue-600"
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            title="Активных"
            value={stats.active_employees}
            icon="✅"
            gradient="from-green-500 to-green-600"
            trend="+5%"
            trendUp={true}
          />
          <StatCard
            title="Общий профит"
            value={formatCurrency(stats.total_profit)}
            icon="💰"
            gradient="from-yellow-500 to-orange-500"
            trend="+23%"
            trendUp={true}
          />
          <StatCard
            title="Расходы"
            value={formatCurrency(stats.total_expenses)}
            subtitle={`${formatPercentage(stats.expense_percentage)} от профита`}
            icon="📊"
            gradient="from-red-500 to-pink-500"
            trend="-8%"
            trendUp={false}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Управление сотрудниками"
          description="Создавайте, редактируйте и управляйте сотрудниками"
          icon="👥"
          gradient="from-blue-500 to-cyan-500"
          href="/employees"
        />
        <QuickActionCard
          title="Финансовый контроль"
          description="Отслеживайте расходы и управляйте бюджетом"
          icon="💰"
          gradient="from-green-500 to-emerald-500"
          href="/expenses"
        />
        <QuickActionCard
          title="Расчет зарплат"
          description="Автоматический расчет и управление зарплатами"
          icon="📊"
          gradient="from-purple-500 to-pink-500"
          href="/salaries"
        />
      </div>
    </div>
  )
}

function ManagerDashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              🎯 Manager Dashboard
            </h2>
            <p className="text-purple-100 text-lg">
              Управляйте командой и мониторинг производительности
            </p>
          </div>
          <div className="text-6xl">🎯</div>
        </div>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Мой заработок"
            value={formatCurrency(stats.total_profit * 0.10)}
            subtitle="10% от общего профита"
            icon="💼"
            gradient="from-purple-500 to-purple-600"
            trend="+15%"
            trendUp={true}
          />
          <StatCard
            title="Активных сотрудников"
            value={stats.active_employees}
            icon="👥"
            gradient="from-blue-500 to-blue-600"
            trend="+3"
            trendUp={true}
          />
          <StatCard
            title="Выполнено транзакций"
            value="1,666"
            icon="📈"
            gradient="from-green-500 to-green-600"
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            title="Средний профит/сотрудник"
            value={formatCurrency(stats.total_profit / Math.max(stats.active_employees, 1))}
            icon="📊"
            gradient="from-orange-500 to-red-500"
            trend="+8%"
            trendUp={true}
          />
        </div>
      )}
    </div>
  )
}

function HRDashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              👥 HR Dashboard
            </h2>
            <p className="text-emerald-100 text-lg">
              Управление персоналом и кадровые процессы
            </p>
          </div>
          <div className="text-6xl">👥</div>
        </div>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Мой заработок"
            value={formatCurrency(stats.total_profit * 0.05)}
            subtitle="5% от общего профита"
            icon="💰"
            gradient="from-emerald-500 to-emerald-600"
            trend="+10%"
            trendUp={true}
          />
          <StatCard
            title="Активных сотрудников"
            value={stats.active_employees}
            icon="👥"
            gradient="from-blue-500 to-blue-600"
            trend="+2"
            trendUp={true}
          />
          <StatCard
            title="Новых за месяц"
            value="3"
            icon="🆕"
            gradient="from-green-500 to-green-600"
            trend="+1"
            trendUp={true}
          />
          <StatCard
            title="Подписанных NDA"
            value="18/18"
            icon="📄"
            gradient="from-purple-500 to-purple-600"
            trend="100%"
            trendUp={true}
          />
        </div>
      )}
    </div>
  )
}

function CFODashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              💼 CFO Dashboard
            </h2>
            <p className="text-amber-100 text-lg">
              Финансовый контроль и управление расходами
            </p>
          </div>
          <div className="text-6xl">💼</div>
        </div>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Мой заработок"
            value={formatCurrency(stats.total_profit * 0.05)}
            subtitle="5% от общего профита"
            icon="💰"
            gradient="from-amber-500 to-amber-600"
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            title="Общий профит"
            value={formatCurrency(stats.total_profit)}
            icon="📈"
            gradient="from-green-500 to-green-600"
            trend="+25%"
            trendUp={true}
          />
          <StatCard
            title="К выплате"
            value={formatCurrency(stats.total_profit * 0.3)}
            icon="💳"
            gradient="from-blue-500 to-blue-600"
            trend="+18%"
            trendUp={true}
          />
          <StatCard
            title="Расходы"
            value={formatCurrency(stats.total_expenses)}
            subtitle={`${formatPercentage(stats.expense_percentage)} от брутто`}
            icon="📊"
            gradient="from-red-500 to-red-600"
            trend="-5%"
            trendUp={false}
          />
        </div>
      )}
    </div>
  )
}

function EmployeeDashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              👤 Мой профиль
            </h2>
            <p className="text-indigo-100 text-lg">
              Личная статистика и управление профилем
            </p>
          </div>
          <div className="text-6xl">👤</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Мой профит"
          value={formatCurrency(238.46)}
          icon="💰"
          gradient="from-indigo-500 to-indigo-600"
          trend="+15%"
          trendUp={true}
        />
        <StatCard
          title="Транзакции"
          value="156"
          icon="📊"
          gradient="from-blue-500 to-blue-600"
          trend="+8"
          trendUp={true}
        />
        <StatCard
          title="Зарплата"
          value={formatCurrency(238.46)}
          icon="💳"
          gradient="from-green-500 to-green-600"
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Бонусы"
          value={formatCurrency(200)}
          icon="🎁"
          gradient="from-purple-500 to-purple-600"
          trend="+25%"
          trendUp={true}
        />
      </div>
    </div>
  )
}

function DefaultDashboard({ user, stats }: { user: User; stats: DashboardStats | null }) {
  return (
    <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-3xl p-8 text-white shadow-2xl">
      <h2 className="text-3xl font-bold mb-4">
        Добро пожаловать, {user.full_name || user.username}!
      </h2>
      <p className="text-gray-200 text-lg">
        Ваша роль: <span className="font-semibold text-white">{user.role}</span>
      </p>
    </div>
  )
}

// Компонент карточки статистики
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  gradient,
  trend,
  trendUp
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: string;
  gradient: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className={`text-sm font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? '↗' : '↘'} {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

// Компонент быстрых действий
function QuickActionCard({
  title,
  description,
  icon,
  gradient,
  href
}: {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  href: string;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
      <div className={`h-16 w-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
