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
    }
  }
}
