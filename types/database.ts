// Типы для базы данных Affectivity

export interface User {
  id: string
  username: string
  email: string
  full_name: string | null
  role: UserRole
  usdt_address: string | null
  usdt_network: string
  is_active: boolean
  created_at: string
  last_login: string | null
  created_by: string | null
}

export type UserRole = 'Admin' | 'CFO' | 'Manager' | 'Employee' | 'Tester'

export interface Bank {
  id: string
  name: string
  country: string
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BankAccount {
  id: string
  bank_id: string
  account_number: string
  account_type: string
  balance: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
  bank?: Bank
}

export interface Card {
  id: string
  card_number: string
  card_type: CardType
  bank_id: string
  status: CardStatus
  assigned_employee_id: string | null
  assigned_casino_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  bank?: Bank
  assigned_employee?: Employee
  assigned_casino?: Casino
}

export type CardType = 'debit' | 'credit' | 'prepaid'
export type CardStatus = 'free' | 'assigned' | 'in_process' | 'completed' | 'blocked'

export interface Casino {
  id: string
  name: string
  url: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  user_id: string
  percentage_rate: number
  total_profit: number
  is_active: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface Transaction {
  id: string
  employee_id: string
  card_id: string
  casino_id: string
  transaction_type: TransactionType
  amount: number
  profit: number
  status: TransactionStatus
  transaction_date: string
  notes: string | null
  created_at: string
  updated_at: string
  employee?: Employee
  card?: Card
  casino?: Casino
}

export type TransactionType = 'deposit' | 'withdrawal'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
  user?: User
}

// Типы для API ответов

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Типы для дашборда

export interface DashboardData {
  summary: DashboardSummary
  recent_transactions: Transaction[]
  card_stats: CardStats
  transaction_stats: TransactionStats
}

export interface DashboardSummary {
  total_banks: number
  total_cards: number
  total_transactions: number
  total_employees: number
  total_casinos: number
  total_profit: number
}

export interface CardStats {
  free: number
  assigned: number
  in_process: number
  completed: number
}

export interface TransactionStats {
  deposits: number
  withdrawals: number
  pending: number
  completed: number
}

// Типы для отчетов

export interface ReportData {
  summary?: SummaryReport
  transactions?: TransactionReport[]
  cards?: CardReport[]
}

export interface SummaryReport {
  total_profit: number
  total_transactions: number
  average_profit_per_transaction: number
  top_employees: EmployeeSummary[]
  top_casinos: CasinoSummary[]
}

export interface EmployeeSummary {
  employee_id: string
  employee_name: string
  total_profit: number
  transaction_count: number
}

export interface CasinoSummary {
  casino_id: string
  casino_name: string
  total_profit: number
  transaction_count: number
}

export interface TransactionReport {
  id: string
  transaction_type: string
  amount: number
  profit: number
  status: string
  transaction_date: string
  employee_name: string
  casino_name: string
  card_number: string
}

export interface CardReport {
  id: string
  card_number: string
  card_type: string
  status: string
  assigned_employee: string | null
  assigned_casino: string | null
  total_transactions: number
  total_profit: number
}

// Типы для форм

export interface LoginForm {
  username: string
  password: string
}

export interface CreateUserForm {
  username: string
  email: string
  full_name?: string
  role: UserRole
  password: string
}

export interface CreateBankForm {
  name: string
  country: string
  currency: string
}

export interface CreateCardForm {
  card_number: string
  card_type: CardType
  bank_id: string
}

export interface CreateCasinoForm {
  name: string
  url: string
  country: string
}

export interface CreateTransactionForm {
  employee_id: string
  card_id: string
  casino_id: string
  transaction_type: TransactionType
  amount: number
  profit: number
  status: TransactionStatus
  transaction_date: string
  notes?: string
}

export interface AssignCardForm {
  card_id: string
  employee_id: string
  casino_id: string
}

// Типы для фильтров

export interface SearchFilters {
  search?: string
  status?: string
  type?: string
  user_id?: string
  start_date?: string
  end_date?: string
}

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

// Типы для уведомлений

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

// Типы для экспорта

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel'
  filename?: string
  includeHeaders?: boolean
}

// Типы для мониторинга

export interface SystemMetrics {
  active_users: number
  total_transactions_today: number
  total_profit_today: number
  system_health: 'healthy' | 'warning' | 'error'
  last_backup: string
}

// Утилитарные типы

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface ValidationError {
  field: string
  message: string
}

// Типы для компонентов

export interface NavigationProps {
  userRole: string
  onLogout?: () => void
}

export interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter: (filters: any) => void
  placeholder?: string
  filters?: FilterOption[]
}

export interface FilterOption {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

export interface ExportDataProps {
  data: any[]
  filename?: string
  onExport?: (format: string, data: any[]) => void
}

export interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
}
