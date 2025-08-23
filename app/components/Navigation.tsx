'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/app/components/Button'

interface NavigationProps {
  userRole: string
}

export default function Navigation({ userRole }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    {
      name: 'Дашборд',
      href: '/',
      icon: '🏠',
      roles: ['Admin', 'Manager', 'HR', 'CFO', 'Employee', 'Tester']
    },
    {
      name: 'Сотрудники',
      href: '/employees',
      icon: '👥',
      roles: ['Admin', 'HR']
    },
    {
      name: 'Расходы',
      href: '/expenses',
      icon: '💰',
      roles: ['Admin', 'CFO']
    },
    {
      name: 'Зарплаты',
      href: '/salaries',
      icon: '💳',
      roles: ['Admin', 'CFO']
    },
    {
      name: 'Транзакции',
      href: '/transactions',
      icon: '📊',
      roles: ['Admin', 'Manager', 'CFO']
    },
    {
      name: 'Карты',
      href: '/cards',
      icon: '💳',
      roles: ['Admin', 'Manager']
    },
    {
      name: 'Профиль',
      href: '/profile',
      icon: '👤',
      roles: ['Admin', 'Manager', 'HR', 'CFO', 'Employee', 'Tester']
    }
  ]

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  )

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Affectivity
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-1">
              {filteredItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="font-semibold">{userRole}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Affectivity
              </h1>
            </div>

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden bg-white/50 hover:bg-white/70 backdrop-blur-sm border-white/20"
            >
              <span className="text-2xl">☰</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 mt-2 mb-4">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {filteredItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
