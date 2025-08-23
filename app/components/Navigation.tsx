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
      { name: 'Сотрудники', href: '/employees', icon: '👥' },
      { name: 'Профиль', href: '/profile', icon: '👤' }
    ],
    'Manager': [
      { name: 'Казино', href: '/casinos', icon: '🎰' },
      { name: 'Банкир → CEO', href: '/banker-transactions', icon: '💸' },
      { name: 'Тестирование', href: '/site-testing', icon: '🧪' },
      { name: 'Транзакции', href: '/transactions', icon: '📊' },
      { name: 'Карты', href: '/cards', icon: '💳' },
      { name: 'Профиль', href: '/profile', icon: '👤' }
    ],
    'CFO': [
      { name: 'Расходы', href: '/expenses', icon: '💰' },
      { name: 'Зарплаты', href: '/salaries', icon: '💳' },
      { name: 'Банкир → CEO', href: '/banker-transactions', icon: '💸' },
      { name: 'Транзакции', href: '/transactions', icon: '📊' },
      { name: 'Профиль', href: '/profile', icon: '👤' }
    ],
    'CEO': [
      { name: 'Банкир → CEO', href: '/banker-transactions', icon: '💸' },
      { name: 'Профиль', href: '/profile', icon: '👤' }
    ],
    'Tester': [
      { name: 'Тестирование', href: '/site-testing', icon: '🧪' },
      { name: 'Профиль', href: '/profile', icon: '👤' }
    ],
    'Employee': [
      { name: 'Профиль', href: '/profile', icon: '👤' }
    ],
    'Admin': [
      { name: 'Сотрудники', href: '/employees', icon: '👥' },
      { name: 'Казино', href: '/casinos', icon: '🎰' },
      { name: 'Банкир → CEO', href: '/banker-transactions', icon: '💸' },
      { name: 'Тестирование', href: '/site-testing', icon: '🧪' },
      { name: 'Расходы', href: '/expenses', icon: '💰' },
      { name: 'Зарплаты', href: '/salaries', icon: '💳' },
      { name: 'Транзакции', href: '/transactions', icon: '📊' },
      { name: 'Карты', href: '/cards', icon: '💳' },
      { name: 'Профиль', href: '/profile', icon: '👤' }
    ]
  }

  const currentRoleItems = roleNavigation[userRole as keyof typeof roleNavigation] || []

  const toggleDropdown = (role: string) => {
    setActiveDropdown(activeDropdown === role ? null : role)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Affectivity
              </span>
            </div>

            {/* Role-based Dropdowns */}
            <div className="flex space-x-2">
              {Object.keys(roleNavigation).map((role) => {
                const items = roleNavigation[role as keyof typeof roleNavigation]
                const isActive = activeDropdown === role
                const hasActiveItem = items.some(item => pathname === item.href)
                
                return (
                  <div key={role} className="relative dropdown-container">
                    <button
                      onClick={() => toggleDropdown(role)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center ${
                        isActive || hasActiveItem
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-2">
                        {role === 'HR' ? '👥' : 
                         role === 'Manager' ? '👨‍💼' : 
                         role === 'CFO' ? '💰' : 
                         role === 'CEO' ? '👑' : 
                         role === 'Tester' ? '🧪' : 
                         role === 'Employee' ? '👤' : 
                         role === 'Admin' ? '⚡' : '👤'}
                      </span>
                      {role}
                      <svg className={`ml-2 h-4 w-4 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isActive && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 z-[99999] min-w-max transform opacity-100 scale-100 transition-all duration-200">
                        <div className="py-2">
                          {items.map((item) => {
                            const isActiveItem = pathname === item.href
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className={`block px-4 py-3 text-sm font-medium transition-all duration-300 ${
                                  isActiveItem
                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-500'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                💬 Сообщения
              </Button>
              <Link href="/profile">
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  👤 Профиль
                </Button>
              </Link>
              {onLogout && (
                <Button
                  onClick={onLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🚪 Выход
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg mr-2">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Affectivity
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300"
            >
              <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 mt-2 mb-4 z-[99999]">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Role-based sections */}
                {Object.keys(roleNavigation).map((role) => {
                  const items = roleNavigation[role as keyof typeof roleNavigation]
                  return (
                    <div key={role} className="space-y-1">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {role}
                      </div>
                      {items.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                            }`}
                          >
                            <span className="mr-3">{item.icon}</span>
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  )
                })}
                
                {/* User Actions */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-white/50 hover:text-gray-900 transition-all duration-300"
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
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:from-red-600 hover:to-pink-600"
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
