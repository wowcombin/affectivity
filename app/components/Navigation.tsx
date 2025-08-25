'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/app/components/Button'

interface NavigationProps {
  userRole: string
  onLogout?: () => void
}

export default function Navigation({ userRole, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  // Закрываем выпадающие меню при клике вне их области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Группируем навигацию по ролям
  const roleNavigation = {
    'HR': [
      { name: 'Дашборд', href: '/dashboard', icon: '📊' },
      { name: 'Сотрудники', href: '/employees', icon: '👥' },
      { name: 'Рабочие файлы', href: '/work-files', icon: '📋' },
      { name: 'Задачи', href: '/tasks', icon: '✅' },
      { name: 'NDA документы', href: '/nda-documents', icon: '📄' }
    ],
    'Manager': [
      { name: 'Дашборд', href: '/dashboard', icon: '📊' },
      { name: 'Сотрудники', href: '/employees', icon: '👥' },
      { name: 'Рабочие файлы', href: '/work-files', icon: '📋' },
      { name: 'Карты', href: '/cards', icon: '💳' },
      { name: 'Транзакции', href: '/transactions', icon: '💰' },
      { name: 'Задачи', href: '/tasks', icon: '✅' },
      { name: 'Проверка выводов', href: '/withdrawal-checks', icon: '🔍' }
    ],
    'CFO': [
      { name: 'Дашборд', href: '/dashboard', icon: '📊' },
      { name: 'Банки и аккаунты', href: '/banks', icon: '🏦' },
      { name: 'Карты', href: '/cards', icon: '💳' },
      { name: 'Расходы', href: '/expenses', icon: '💸' },
      { name: 'Отчеты', href: '/reports', icon: '📈' },
      { name: 'Переводы', href: '/transfers', icon: '💱' },
      { name: 'Сообщения', href: '/messages', icon: '💬' }
    ],
    'Tester': [
      { name: 'Дашборд', href: '/dashboard', icon: '📊' },
      { name: 'Тестовые сайты', href: '/test-sites', icon: '🧪' },
      { name: 'Рабочие файлы', href: '/work-files', icon: '📋' },
      { name: 'Активные сайты', href: '/active-sites', icon: '🌐' }
    ],
    'Employee': [
      { name: 'Дашборд', href: '/dashboard', icon: '📊' },
      { name: 'Рабочие файлы', href: '/work-files', icon: '📋' },
      { name: 'Мои задачи', href: '/my-tasks', icon: '✅' },
      { name: 'Моя статистика', href: '/my-stats', icon: '📊' },
      { name: 'Лидеры месяца', href: '/monthly-leaders', icon: '🏆' }
    ],
    'Admin': [
      { name: 'Дашборд', href: '/dashboard', icon: '📊' },
      { name: 'Банки и аккаунты', href: '/banks', icon: '🏦' },
      { name: 'Карты', href: '/cards', icon: '💳' },
      { name: 'Казино', href: '/casinos', icon: '🎰' },
      { name: 'Сотрудники', href: '/employees', icon: '👥' },
      { name: 'Транзакции', href: '/transactions', icon: '💰' },
      { name: 'Отчеты', href: '/reports', icon: '📈' },
      { name: 'Пользователи', href: '/users', icon: '👤' },
      { name: 'Логи', href: '/logs', icon: '📋' },
      { name: 'Задачи', href: '/tasks', icon: '✅' },
      { name: 'Зарплаты', href: '/salaries', icon: '💵' }
    ]
  }

  const currentRoleItems = roleNavigation[userRole as keyof typeof roleNavigation] || []

  const toggleDropdown = (role: string) => {
    setActiveDropdown(activeDropdown === role ? null : role)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-all duration-300">
                <span className="text-white font-black text-xl">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Affectivity
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wider">
                  Employee Management System
                </span>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex items-center space-x-1">
              {currentRoleItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="mr-2 text-lg">{item.icon}</span>
                    {item.name}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                    )}
                    <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' : 'group-hover:bg-white/5'
                    }`}></div>
                  </Link>
                )
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 group">
                <span className="text-gray-300 group-hover:text-white text-lg">🔔</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </button>

              {/* Profile */}
              <Link href="/profile">
                <button className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 group">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">👤</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">Профиль</div>
                    <div className="text-xs text-gray-400">{userRole}</div>
                  </div>
                </button>
              </Link>

              {/* Logout */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Выход
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl border-b border-purple-500/20">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-lg">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Affectivity
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {userRole}
                </span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-500/20 mt-2 mb-4 z-[99999]">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Current Role Navigation */}
                <div className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    Навигация
                  </div>
                  {currentRoleItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
                
                {/* User Actions */}
                <div className="border-t border-purple-500/20 pt-2 mt-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                  >
                    <span className="mr-3">👤</span>
                    Профиль
                  </Link>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        onLogout()
                      }}
                      className="w-full text-left px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:from-red-600 hover:to-pink-600"
                    >
                      <span className="mr-3">🚪</span>
                      Выход
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
