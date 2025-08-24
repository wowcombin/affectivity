'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/Button'
import Navigation from '@/app/components/Navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface WorkEntry {
  id: string
  casino_name: string
  deposit_amount: number
  withdrawal_amount: number
  card_number: string
  card_expiry: string
  card_cvv: string
  account_username: string
  account_password: string
  card_type: 'pink' | 'gray'
  bank_name: string
  withdrawal_status: 'new' | 'sent' | 'received' | 'problem' | 'blocked'
  issue_description?: string
  created_at: string
  updated_at: string
  user?: {
    username: string
    role: string
  }
}

interface DraftFile {
  id: string
  name: string
  type: 'excel' | 'google_sheets'
  url?: string
  created_at: string
  user?: {
    username: string
    role: string
  }
}

export default function WorkFilesPage() {
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([])
  const [draftFiles, setDraftFiles] = useState<DraftFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [showNewEntryForm, setShowNewEntryForm] = useState(false)
  const [showDraftForm, setShowDraftForm] = useState(false)
  const [currentMonth, setCurrentMonth] = useState('')
  const [formData, setFormData] = useState({
    casino_name: '',
    deposit_amount: '',
    withdrawal_amount: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    account_username: '',
    account_password: '',
    card_type: 'pink' as 'pink' | 'gray',
    bank_name: '',
    withdrawal_status: 'new' as 'new' | 'sent' | 'received' | 'problem' | 'blocked',
    issue_description: ''
  })
  const [draftFormData, setDraftFormData] = useState({
    name: '',
    type: 'excel' as 'excel' | 'google_sheets',
    url: ''
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
      setCurrentMonth(new Date().toISOString().slice(0, 7))
      loadWorkFiles()
      loadDraftFiles()
    } else {
      router.push('/login')
    }
  }, [])

  const loadWorkFiles = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/work-files', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setWorkEntries(data.entries || [])
      } else {
        console.error('Failed to load work files')
        toast.error('Ошибка загрузки рабочих файлов')
      }
    } catch (error) {
      console.error('Work files error:', error)
      toast.error('Ошибка загрузки рабочих файлов')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDraftFiles = async () => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/work-files/drafts', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDraftFiles(data.drafts || [])
      }
    } catch (error) {
      console.error('Draft files error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/work-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Запись успешно добавлена!')
        setShowNewEntryForm(false)
        setFormData({
          casino_name: '',
          deposit_amount: '',
          withdrawal_amount: '',
          card_number: '',
          card_expiry: '',
          card_cvv: '',
          account_username: '',
          account_password: '',
          card_type: 'pink',
          bank_name: '',
          withdrawal_status: 'new',
          issue_description: ''
        })
        loadWorkFiles()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка добавления записи')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Ошибка добавления записи')
    }
  }

  const handleDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch('/api/work-files/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(draftFormData)
      })

      if (response.ok) {
        toast.success('Черновик успешно создан!')
        setShowDraftForm(false)
        setDraftFormData({
          name: '',
          type: 'excel',
          url: ''
        })
        loadDraftFiles()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка создания черновика')
      }
    } catch (error) {
      console.error('Draft submit error:', error)
      toast.error('Ошибка создания черновика')
    }
  }

  const updateStatus = async (entryId: string, status: string) => {
    try {
      const authToken = localStorage.getItem('auth-token')
      const response = await fetch(`/api/work-files/${entryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('Статус обновлен!')
        loadWorkFiles()
      } else {
        toast.error('Ошибка обновления статуса')
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Ошибка обновления статуса')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'from-blue-500 to-blue-600'
      case 'sent': return 'from-yellow-500 to-yellow-600'
      case 'received': return 'from-green-500 to-green-600'
      case 'problem': return 'from-red-500 to-red-600'
      case 'blocked': return 'from-gray-500 to-gray-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return '🆕'
      case 'sent': return '📤'
      case 'received': return '✅'
      case 'problem': return '⚠️'
      case 'blocked': return '🚫'
      default: return '❓'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Загрузка рабочих файлов...</p>
        </div>
      </div>
    )
  }

  if (!['Employee', 'Manager', 'HR', 'Admin'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Navigation userRole={userRole} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h3>
            <p className="text-gray-600">Только сотрудники, менеджеры и HR могут просматривать рабочие файлы</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📋 Рабочие файлы
                {userRole === 'Admin' && <span className="text-sm text-blue-600 ml-2">(Все сотрудники)</span>}
              </h1>
              <p className="text-gray-600">Месяц: {currentMonth}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowNewEntryForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                ➕ Добавить запись
              </Button>
              <Button
                onClick={() => setShowDraftForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                📄 Создать черновик
              </Button>
            </div>
          </div>
        </div>

        {/* Work Entries */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Записи о работе</h2>
          
          {workEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600">Нет записей за текущий месяц</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {userRole === 'Admin' && (
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Сотрудник</th>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Казино</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Депозит</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Вывод</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Карта</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Тип</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Банк</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Статус</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {workEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      {userRole === 'Admin' && (
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-semibold text-gray-900">{entry.user?.username || 'Неизвестно'}</div>
                            <div className="text-sm text-gray-500">{entry.user?.role || 'Employee'}</div>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">{entry.casino_name}</div>
                          <div className="text-sm text-gray-500">{entry.account_username}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(entry.deposit_amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-blue-600 font-semibold">
                          {formatCurrency(entry.withdrawal_amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm">
                          {entry.card_number.slice(0, 4)} **** **** {entry.card_number.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.card_expiry} | {entry.card_cvv}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.card_type === 'pink' 
                            ? 'bg-pink-100 text-pink-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.card_type === 'pink' ? '🩷 Розовая' : '⚫ Серая'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{entry.bank_name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(entry.withdrawal_status)} text-white`}>
                          {getStatusIcon(entry.withdrawal_status)} {entry.withdrawal_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={entry.withdrawal_status}
                          onChange={(e) => updateStatus(entry.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="new">Новый</option>
                          <option value="sent">Отправлен</option>
                          <option value="received">Получен</option>
                          <option value="problem">Проблема</option>
                          <option value="blocked">Заблокирован</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Draft Files */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📄 Черновики</h2>
          
          {draftFiles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-gray-600">Нет созданных черновиков</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftFiles.map((draft) => (
                <div key={draft.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">
                      {draft.type === 'excel' ? '📊' : '📋'}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(draft.created_at)}</span>
                  </div>
                  {userRole === 'Admin' && draft.user && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500">Создал: {draft.user.username}</div>
                      <div className="text-xs text-gray-500">Роль: {draft.user.role}</div>
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2">{draft.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {draft.type === 'excel' ? 'Excel таблица' : 'Google таблица'}
                  </p>
                  {draft.url && (
                    <a
                      href={draft.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      🔗 Открыть файл
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Entry Modal */}
      {showNewEntryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Добавить новую запись</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎰 Название казино
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.casino_name}
                      onChange={(e) => setFormData({...formData, casino_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💰 Сумма депозита
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💸 Сумма вывода
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.withdrawal_amount}
                      onChange={(e) => setFormData({...formData, withdrawal_amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💳 Номер карты
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.card_number}
                      onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Срок действия
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.card_expiry}
                      onChange={(e) => setFormData({...formData, card_expiry: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔐 CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.card_cvv}
                      onChange={(e) => setFormData({...formData, card_cvv: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Логин аккаунта
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.account_username}
                      onChange={(e) => setFormData({...formData, account_username: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔑 Пароль аккаунта
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.account_password}
                      onChange={(e) => setFormData({...formData, account_password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎨 Тип карты
                    </label>
                    <select
                      value={formData.card_type}
                      onChange={(e) => setFormData({...formData, card_type: e.target.value as 'pink' | 'gray'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pink">🩷 Розовая</option>
                      <option value="gray">⚫ Серая</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏦 Банк карты
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Описание проблемы (если есть)
                  </label>
                  <textarea
                    value={formData.issue_description}
                    onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Опишите проблему с выводом..."
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowNewEntryForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    ✅ Сохранить
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Draft Modal */}
      {showDraftForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📄 Создать черновик</h2>
              
              <form onSubmit={handleDraftSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Название файла
                  </label>
                  <input
                    type="text"
                    required
                    value={draftFormData.name}
                    onChange={(e) => setDraftFormData({...draftFormData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Мой рабочий файл"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📊 Тип файла
                  </label>
                  <select
                    value={draftFormData.type}
                    onChange={(e) => setDraftFormData({...draftFormData, type: e.target.value as 'excel' | 'google_sheets'})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excel">📊 Excel таблица</option>
                    <option value="google_sheets">📋 Google таблица</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔗 Ссылка на файл (опционально)
                  </label>
                  <input
                    type="url"
                    value={draftFormData.url}
                    onChange={(e) => setDraftFormData({...draftFormData, url: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowDraftForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900"
                  >
                    ❌ Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    ✅ Создать
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
