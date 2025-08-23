export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          password_hash: string
          full_name: string | null
          phone: string | null
          role: string
          usdt_address: string | null
          usdt_network: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          last_login: string | null
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      employees: {
        Row: {
          id: string
          user_id: string
          percentage_rate: number
          total_profit: number
          is_active: boolean
          fired_at: string | null
          fired_by: string | null
          fire_reason: string | null
          last_working_day: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      casinos: {
        Row: {
          id: string
          name: string
          url: string | null
          commission_rate: number | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['casinos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['casinos']['Insert']>
      }
      cards: {
        Row: {
          id: string
          card_number: string
          card_bin: string
          card_holder: string | null
          expiry_date: string | null
          status: string
          assigned_to: string | null
          assigned_at: string | null
          casino_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cards']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cards']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          employee_id: string
          card_id: string | null
          casino_id: string
          transaction_type: string
          amount: number
          profit: number | null
          status: string
          transaction_date: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      salaries: {
        Row: {
          id: string
          employee_id: string
          month: string
          base_salary: number
          performance_bonus: number
          leader_bonus: number
          total_salary: number
          is_paid: boolean
          paid_at: string | null
          payment_tx_hash: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['salaries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['salaries']['Insert']>
      }
      role_earnings: {
        Row: {
          id: string
          user_id: string
          role: string
          month: string
          total_employees_profit: number
          percentage: number
          total_earnings: number
          is_paid: boolean
          paid_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['role_earnings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['role_earnings']['Insert']>
      }
      nda_documents: {
        Row: {
          id: string
          employee_id: string
          document_content: string
          signature_date: string | null
          ip_address: string | null
          is_signed: boolean
          signed_document_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['nda_documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['nda_documents']['Insert']>
      }
      expenses: {
        Row: {
          id: string
          description: string
          amount_usd: number
          expense_date: string
          created_by: string | null
          month: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
      salary_calculations: {
        Row: {
          id: string
          month: string
          gross_profit: number
          total_expenses: number
          expense_percentage: number
          net_profit: number
          calculation_base: string
          calculated_at: string
        }
        Insert: Omit<Database['public']['Tables']['salary_calculations']['Row'], 'id' | 'calculated_at'>
        Update: Partial<Database['public']['Tables']['salary_calculations']['Insert']>
      }
      fired_employees_archive: {
        Row: {
          id: string
          employee_id: string
          username: string
          full_name: string | null
          role: string | null
          hire_date: string | null
          fire_date: string | null
          fire_reason: string | null
          fired_by: string | null
          total_earned: number | null
          last_salary: number | null
          documents_archived: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fired_employees_archive']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fired_employees_archive']['Insert']>
      }
      blocked_ips: {
        Row: {
          id: string
          ip_address: string
          blocked_reason: string | null
          related_employee_id: string | null
          blocked_by: string | null
          blocked_at: string
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['blocked_ips']['Row'], 'id' | 'blocked_at'>
        Update: Partial<Database['public']['Tables']['blocked_ips']['Insert']>
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          details: any
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          ip_address: string | null
          user_agent: string | null
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_sessions']['Insert']>
      }
    }
  }
}

// Типы для ролей пользователей
export type UserRole = 'Admin' | 'Manager' | 'HR' | 'CFO' | 'Employee' | 'Tester'

// Типы для статусов карт
export type CardStatus = 'available' | 'in_use' | 'blocked' | 'expired'

// Типы для типов транзакций
export type TransactionType = 'deposit' | 'withdrawal' | 'bonus'

// Типы для статусов транзакций
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

// Типы для базы расчета зарплат
export type CalculationBase = 'gross' | 'net'

// Интерфейсы для API
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: Database['public']['Tables']['users']['Row']
  token: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  full_name?: string
  phone?: string
  role: UserRole
  usdt_address?: string
  usdt_network?: string
}

export interface UpdateUserRequest {
  full_name?: string
  phone?: string
  usdt_address?: string
  usdt_network?: string
}

export interface FireEmployeeRequest {
  employee_id: string
  reason: string
  comments?: string
  last_working_day: string
  block_ips: boolean
  revoke_cards: boolean
  archive_data: boolean
}

export interface AddExpenseRequest {
  description: string
  amount_usd: number
  expense_date: string
}

export interface CalculateSalariesRequest {
  month: string
}

export interface SalaryCalculationResult {
  month: string
  gross_profit: number
  total_expenses: number
  expense_percentage: number
  net_profit: number
  calculation_base: CalculationBase
  employees_salaries: Array<{
    employee_id: string
    username: string
    base_salary: number
    performance_bonus: number
    leader_bonus: number
    total_salary: number
  }>
  role_earnings: Array<{
    user_id: string
    username: string
    role: UserRole
    total_earnings: number
  }>
}

// Интерфейсы для дашбордов
export interface DashboardStats {
  total_employees: number
  active_employees: number
  total_profit: number
  monthly_profit: number
  pending_salaries: number
  total_expenses: number
  expense_percentage: number
}

export interface EmployeeStats {
  id: string
  username: string
  full_name: string
  role: UserRole
  total_profit: number
  monthly_profit: number
  total_salary: number
  is_active: boolean
  hire_date: string
  last_transaction: string | null
}

export interface ManagerDashboardData {
  stats: DashboardStats
  employees: EmployeeStats[]
  pending_tickets: number
  urgent_tickets: number
  high_priority_tickets: number
  normal_tickets: number
  card_requests: Array<{
    employee_id: string
    username: string
    casino_name: string
    bin: string
    card_count: number
  }>
}

export interface HRDashboardData {
  stats: DashboardStats
  employees: Array<EmployeeStats & {
    nda_signed: boolean
    nda_date: string | null
  }>
  new_employees_this_month: number
  total_nda_signed: number
  total_nda_pending: number
}

export interface CFODashboardData {
  stats: DashboardStats
  expenses: Array<{
    id: string
    description: string
    amount_usd: number
    expense_date: string
    created_by: string
  }>
  salary_distribution: {
    employees: number
    managers: number
    hr: number
    cfo: number
    testers: number
  }
  card_status: {
    total: number
    in_use: number
    available: number
    blocked: number
  }
}

export interface EmployeeDashboardData {
  profile: Database['public']['Tables']['users']['Row']
  employee_data: Database['public']['Tables']['employees']['Row']
  monthly_stats: {
    profit: number
    transactions: number
    salary: number
    bonus: number
  }
  recent_transactions: Array<{
    id: string
    casino_name: string
    transaction_type: TransactionType
    amount: number
    profit: number
    status: TransactionStatus
    transaction_date: string
  }>
  assigned_cards: Array<{
    id: string
    card_bin: string
    casino_name: string
    status: CardStatus
  }>
}
