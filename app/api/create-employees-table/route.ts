import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE EMPLOYEES TABLE API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Создаем таблицу сотрудников
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS employees (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL,
          position TEXT NOT NULL,
          salary DECIMAL(10,2) NOT NULL,
          hire_date DATE NOT NULL,
          is_active BOOLEAN DEFAULT true,
          bank_name TEXT NOT NULL,
          bank_country TEXT NOT NULL,
          account_number TEXT NOT NULL,
          sort_code TEXT NOT NULL,
          card_number TEXT NOT NULL,
          card_expiry TEXT NOT NULL,
          card_cvv TEXT NOT NULL,
          login_url TEXT NOT NULL,
          login_username TEXT NOT NULL,
          login_password TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (createTableError) {
      console.error('Error creating table:', createTableError)
      return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
    }

    // Создаем индексы
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
        CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
        CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
        CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position);
        CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);
      `
    })

    if (indexError) {
      console.error('Error creating indexes:', indexError)
    }

    // Создаем триггер
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_employees_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_update_employees_updated_at ON employees;
        CREATE TRIGGER trigger_update_employees_updated_at
          BEFORE UPDATE ON employees
          FOR EACH ROW
          EXECUTE FUNCTION update_employees_updated_at();
      `
    })

    if (triggerError) {
      console.error('Error creating trigger:', triggerError)
    }

    // Настраиваем RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
      `
    })

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError)
    }

    // Создаем политики
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view own employee data" ON employees;
        DROP POLICY IF EXISTS "Admin HR Manager can view all employees" ON employees;
        DROP POLICY IF EXISTS "Admin HR can create employees" ON employees;
        DROP POLICY IF EXISTS "Admin HR Manager can update employees" ON employees;
        DROP POLICY IF EXISTS "Only Admin can delete employees" ON employees;

        CREATE POLICY "Users can view own employee data" ON employees
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Admin HR Manager can view all employees" ON employees
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE users.id = auth.uid() 
              AND users.role IN ('Admin', 'HR', 'Manager')
              AND users.is_active = true
            )
          );

        CREATE POLICY "Admin HR can create employees" ON employees
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM users 
              WHERE users.id = auth.uid() 
              AND users.role IN ('Admin', 'HR')
              AND users.is_active = true
            )
          );

        CREATE POLICY "Admin HR Manager can update employees" ON employees
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE users.id = auth.uid() 
              AND users.role IN ('Admin', 'HR', 'Manager')
              AND users.is_active = true
            )
          );

        CREATE POLICY "Only Admin can delete employees" ON employees
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE users.id = auth.uid() 
              AND users.role = 'Admin'
              AND users.is_active = true
            )
          );
      `
    })

    if (policiesError) {
      console.error('Error creating policies:', policiesError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Employees table created successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/create-employees-table:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
