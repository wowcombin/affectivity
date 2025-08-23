// @ts-nocheck
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          full_name: string
          role: UserRole
          password_hash: string
          usdt_address: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          hired_date: string | null
          fired_date: string | null
          hr_notes: string | null
        }
        Insert: {
          id?: string
          username: string
          email: string
          full_name: string
          role: UserRole
          password_hash: string
          usdt_address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          hired_date?: string | null
          fired_date?: string | null
          hr_notes?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          full_name?: string
          role?: UserRole
          password_hash?: string
          usdt_address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          hired_date?: string | null
          fired_date?: string | null
          hr_notes?: string | null
        }
      }
      
      // Новая система рабочих файлов
      work_files: {
        Row: {
          id: string
          employee_id: string
          month: string // YYYY-MM
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
          withdrawal_question: string | null
          created_at: string
          updated_at: string
          is_draft: boolean
        }
        Insert: {
          id?: string
          employee_id: string
          month: string
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
          withdrawal_status?: 'new' | 'sent' | 'received' | 'problem' | 'blocked'
          withdrawal_question?: string | null
          created_at?: string
          updated_at?: string
          is_draft?: boolean
        }
        Update: {
          id?: string
          employee_id?: string
          month?: string
          casino_name?: string
          deposit_amount?: number
          withdrawal_amount?: number
          card_number?: string
          card_expiry?: string
          card_cvv?: string
          account_username?: string
          account_password?: string
          card_type?: 'pink' | 'gray'
          bank_name?: string
          withdrawal_status?: 'new' | 'sent' | 'received' | 'problem' | 'blocked'
          withdrawal_question?: string | null
          created_at?: string
          updated_at?: string
          is_draft?: boolean
        }
      }

      // Система тестирования сайтов
      test_sites: {
        Row: {
          id: string
          casino_name: string
          promo_url: string
          card_bins: string[] // первые 6 цифр карт
          currency: string
          withdrawal_time_type: 'instant' | 'minutes' | 'hours'
          withdrawal_time_value: number | null
          manual_url: string | null
          status: 'active' | 'processing' | 'checking'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          casino_name: string
          promo_url: string
          card_bins: string[]
          currency: string
          withdrawal_time_type: 'instant' | 'minutes' | 'hours'
          withdrawal_time_value?: number | null
          manual_url?: string | null
          status?: 'active' | 'processing' | 'checking'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          casino_name?: string
          promo_url?: string
          card_bins?: string[]
          currency?: string
          withdrawal_time_type?: 'instant' | 'minutes' | 'hours'
          withdrawal_time_value?: number | null
          manual_url?: string | null
          status?: 'active' | 'processing' | 'checking'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }

      // Система банков и карт
      banks: {
        Row: {
          id: string
          name: string
          type: 'revolut' | 'uk' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'revolut' | 'uk' | 'other'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'revolut' | 'uk' | 'other'
          created_at?: string
          updated_at?: string
        }
      }

      bank_accounts: {
        Row: {
          id: string
          bank_id: string
          account_name: string
          account_number: string
          sort_code: string
          login_url: string
          login_password: string
          pink_cards_daily_limit: number
          pink_cards_remaining: number
          last_reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank_id: string
          account_name: string
          account_number: string
          sort_code: string
          login_url: string
          login_password: string
          pink_cards_daily_limit?: number
          pink_cards_remaining?: number
          last_reset_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank_id?: string
          account_name?: string
          account_number?: string
          sort_code?: string
          login_url?: string
          login_password?: string
          pink_cards_daily_limit?: number
          pink_cards_remaining?: number
          last_reset_date?: string
          created_at?: string
          updated_at?: string
        }
      }

      cards: {
        Row: {
          id: string
          bank_account_id: string
          card_number: string
          expiry_date: string
          cvv: string
          card_type: 'pink' | 'gray'
          status: 'free' | 'assigned' | 'in_process' | 'completed'
          assigned_employee_id: string | null
          assigned_casino_id: string | null
          deposit_amount: number | null
          withdrawal_amount: number | null
          profit: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank_account_id: string
          card_number: string
          expiry_date: string
          cvv: string
          card_type: 'pink' | 'gray'
          status?: 'free' | 'assigned' | 'in_process' | 'completed'
          assigned_employee_id?: string | null
          assigned_casino_id?: string | null
          deposit_amount?: number | null
          withdrawal_amount?: number | null
          profit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank_account_id?: string
          card_number?: string
          expiry_date?: string
          cvv?: string
          card_type?: 'pink' | 'gray'
          status?: 'free' | 'assigned' | 'in_process' | 'completed'
          assigned_employee_id?: string | null
          assigned_casino_id?: string | null
          deposit_amount?: number | null
          withdrawal_amount?: number | null
          profit?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      // Система задач (как Asana)
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          assigned_to: string
          assigned_by: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'in_progress' | 'review' | 'done'
          due_date: string
          estimated_hours: number
          actual_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          assigned_to: string
          assigned_by: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          due_date: string
          estimated_hours: number
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          assigned_to?: string
          assigned_by?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          due_date?: string
          estimated_hours?: number
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      task_notifications: {
        Row: {
          id: string
          task_id: string
          user_id: string
          type: 'assigned' | 'updated' | 'due_soon' | 'overdue' | 'completed'
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          type: 'assigned' | 'updated' | 'due_soon' | 'overdue' | 'completed'
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          type?: 'assigned' | 'updated' | 'due_soon' | 'overdue' | 'completed'
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }

      // Система переводов CFO -> CEO
      cfo_transfers: {
        Row: {
          id: string
          amount: number
          usdt_address: string
          sent_by: string
          sent_at: string
          confirmed_by: string | null
          confirmed_at: string | null
          status: 'pending' | 'confirmed' | 'rejected'
        }
        Insert: {
          id?: string
          amount: number
          usdt_address: string
          sent_by: string
          sent_at?: string
          confirmed_by?: string | null
          confirmed_at?: string | null
          status?: 'pending' | 'confirmed' | 'rejected'
        }
        Update: {
          id?: string
          amount?: number
          usdt_address?: string
          sent_by?: string
          sent_at?: string
          confirmed_by?: string | null
          confirmed_at?: string | null
          status?: 'pending' | 'confirmed' | 'rejected'
        }
      }

      // NDA документы
      nda_documents: {
        Row: {
          id: string
          employee_id: string
          document_url: string
          signed_at: string | null
          status: 'pending' | 'signed' | 'expired'
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          document_url: string
          signed_at?: string | null
          status?: 'pending' | 'signed' | 'expired'
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          document_url?: string
          signed_at?: string | null
          status?: 'pending' | 'signed' | 'expired'
          created_at?: string
        }
      }

      // Обновленная система зарплат
      salary_calculations: {
        Row: {
          id: string
          employee_id: string
          month: string // YYYY-MM
          base_salary: number
          bonus_amount: number
          leader_bonus: number
          total_salary: number
          gross_profit: number
          expenses: number
          net_profit: number
          currency_conversion_rate: number
          calculated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          month: string
          base_salary: number
          bonus_amount: number
          leader_bonus: number
          total_salary: number
          gross_profit: number
          expenses: number
          net_profit: number
          currency_conversion_rate: number
          calculated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          month?: string
          base_salary?: number
          bonus_amount?: number
          leader_bonus?: number
          total_salary?: number
          gross_profit?: number
          expenses?: number
          net_profit?: number
          currency_conversion_rate?: number
          calculated_at?: string
        }
      }

      // Статистика лидеров месяца
      monthly_leaders: {
        Row: {
          id: string
          month: string // YYYY-MM
          employee_id: string
          total_profit: number
          total_transactions: number
          max_single_transaction: number
          rank: number
          created_at: string
        }
        Insert: {
          id?: string
          month: string
          employee_id: string
          total_profit: number
          total_transactions: number
          max_single_transaction: number
          rank: number
          created_at?: string
        }
        Update: {
          id?: string
          month?: string
          employee_id?: string
          total_profit?: number
          total_transactions?: number
          max_single_transaction?: number
          rank?: number
          created_at?: string
        }
      }

      // Существующие таблицы (обновленные)
      casinos: {
        Row: {
          id: string
          name: string
          url: string
          status: CasinoStatus
          added_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          status?: CasinoStatus
          added_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          status?: CasinoStatus
          added_by?: string
          created_at?: string
          updated_at?: string
        }
      }

      transactions: {
        Row: {
          id: string
          casino_id: string
          card_id: string
          employee_id: string
          amount: number
          type: 'deposit' | 'withdrawal'
          status: TransactionStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          casino_id: string
          card_id: string
          employee_id: string
          amount: number
          type: 'deposit' | 'withdrawal'
          status?: TransactionStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          casino_id?: string
          card_id?: string
          employee_id?: string
          amount?: number
          type?: 'deposit' | 'withdrawal'
          status?: TransactionStatus
          created_at?: string
          updated_at?: string
        }
      }

      expenses: {
        Row: {
          id: string
          description: string
          amount: number
          category: string
          date: string
          added_by: string
          created_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          category: string
          date: string
          added_by: string
          created_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          category?: string
          date?: string
          added_by?: string
          created_at?: string
        }
      }

      fired_employees_archive: {
        Row: {
          id: string
          user_id: string
          fired_by: string
          fired_at: string
          reason: string
          ip_address: string
        }
        Insert: {
          id?: string
          user_id: string
          fired_by: string
          fired_at?: string
          reason: string
          ip_address: string
        }
        Update: {
          id?: string
          user_id?: string
          fired_by?: string
          fired_at?: string
          reason?: string
          ip_address?: string
        }
      }

      blocked_ips: {
        Row: {
          id: string
          ip_address: string
          blocked_at: string
          reason: string
        }
        Insert: {
          id?: string
          ip_address: string
          blocked_at?: string
          reason: string
        }
        Update: {
          id?: string
          ip_address?: string
          blocked_at?: string
          reason?: string
        }
      }

      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          details: string
          ip_address: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details: string
          ip_address: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          details?: string
          ip_address?: string
          created_at?: string
        }
      }

      user_sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
  }
}

// Типы для ролей пользователей
export type UserRole = 'Admin' | 'Manager' | 'HR' | 'CFO' | 'Employee' | 'Tester'

// Статусы казино
export type CasinoStatus = 'active' | 'inactive' | 'blocked'

// Статусы транзакций
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

// Статусы карт
export type CardStatus = 'free' | 'assigned' | 'in_process' | 'completed'

// Приоритеты задач
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// Статусы задач
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

// API типы
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}

export interface CreateUserRequest {
  username: string
  email: string
  full_name: string
  role: UserRole
  password: string
  usdt_address?: string
}

export interface UpdateUserRequest {
  id: string
  username?: string
  email?: string
  full_name?: string
  role?: UserRole
  usdt_address?: string
  is_active?: boolean
  hr_notes?: string
}

export interface CreateWorkFileRequest {
  employee_id: string
  month: string
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
  withdrawal_question?: string
  is_draft?: boolean
}

export interface CreateTestSiteRequest {
  casino_name: string
  promo_url: string
  card_bins: string[]
  currency: string
  withdrawal_time_type: 'instant' | 'minutes' | 'hours'
  withdrawal_time_value?: number
  manual_url?: string
}

export interface CreateBankRequest {
  name: string
  type: 'revolut' | 'uk' | 'other'
}

export interface CreateBankAccountRequest {
  bank_id: string
  account_name: string
  account_number: string
  sort_code: string
  login_url: string
  login_password: string
  pink_cards_daily_limit?: number
}

export interface CreateCardRequest {
  bank_account_id: string
  card_number: string
  expiry_date: string
  cvv: string
  card_type: 'pink' | 'gray'
}

export interface CreateTaskRequest {
  title: string
  description: string
  assigned_to: string
  priority: TaskPriority
  due_date: string
  estimated_hours: number
}

export interface CreateCFOTransferRequest {
  amount: number
  usdt_address: string
}

export interface DashboardStats {
  total_employees: number
  active_employees: number
  total_profit: number
  monthly_profit: number
  monthly_expenses: number
  pending_withdrawals: number
  active_tasks: number
  overdue_tasks: number
  free_cards: number
  assigned_cards: number
  monthly_leader: {
    name: string
    profit: number
    rank: number
  } | null
  days_until_salary: number
}

export interface EmployeeStats {
  id: string
  name: string
  role: UserRole
  monthly_profit: number
  total_transactions: number
  rank: number
  tasks_completed: number
  tasks_pending: number
}

export interface BankStats {
  id: string
  name: string
  total_cards: number
  free_cards: number
  total_profit: number
  pink_cards_remaining: number
}

export interface CardAssignment {
  card_id: string
  employee_id: string
  casino_id: string
  card_type: 'pink' | 'gray'
}

export interface MassAssignmentRequest {
  assignments: CardAssignment[]
}

export interface SalaryCalculation {
  employee_id: string
  base_salary: number
  bonus_amount: number
  leader_bonus: number
  total_salary: number
  gross_profit: number
  expenses: number
  net_profit: number
  currency_conversion_rate: number
}

// Утилитарные типы
export type User = Database['public']['Tables']['users']['Row']
export type WorkFile = Database['public']['Tables']['work_files']['Row']
export type TestSite = Database['public']['Tables']['test_sites']['Row']
export type Bank = Database['public']['Tables']['banks']['Row']
export type BankAccount = Database['public']['Tables']['bank_accounts']['Row']
export type Card = Database['public']['Tables']['cards']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type CFOTransfer = Database['public']['Tables']['cfo_transfers']['Row']
export type NDADocument = Database['public']['Tables']['nda_documents']['Row']
export type SalaryCalculationRow = Database['public']['Tables']['salary_calculations']['Row']
export type MonthlyLeader = Database['public']['Tables']['monthly_leaders']['Row']
