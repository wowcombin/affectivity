import { Client } from 'pg'
import 'dotenv/config'

async function createLogsTable() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('=== CREATING ACTIVITY LOGS TABLE ===')
    await client.connect()
    
    // Создаем таблицу activity_logs
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    await client.query(createTableQuery)
    console.log('✅ Activity logs table created successfully')

    // Создаем индексы для оптимизации
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON activity_logs(user_id, action);
    `
    
    await client.query(createIndexesQuery)
    console.log('✅ Activity logs indexes created successfully')

    // Включаем RLS
    await client.query('ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY')
    console.log('✅ RLS enabled for activity_logs table')

    // Создаем политики RLS
    const createPoliciesQuery = `
      -- Политика для чтения логов (только Admin)
      CREATE POLICY IF NOT EXISTS "Admin can read all logs" ON activity_logs
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'Admin'
            AND users.is_active = true
          )
        );

      -- Политика для создания логов (все авторизованные пользователи)
      CREATE POLICY IF NOT EXISTS "Users can create their own logs" ON activity_logs
        FOR INSERT WITH CHECK (
          auth.uid() = user_id
        );

      -- Политика для обновления логов (только Admin)
      CREATE POLICY IF NOT EXISTS "Admin can update all logs" ON activity_logs
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'Admin'
            AND users.is_active = true
          )
        );

      -- Политика для удаления логов (только Admin)
      CREATE POLICY IF NOT EXISTS "Admin can delete all logs" ON activity_logs
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'Admin'
            AND users.is_active = true
          )
        );
    `
    
    await client.query(createPoliciesQuery)
    console.log('✅ RLS policies created for activity_logs table')

    // Создаем функцию для автоматического обновления updated_at
    const createUpdateFunction = `
      CREATE OR REPLACE FUNCTION update_activity_logs_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `
    
    await client.query(createUpdateFunction)
    console.log('✅ Update function created')

    // Создаем триггер для автоматического обновления updated_at
    const createTrigger = `
      DROP TRIGGER IF EXISTS trigger_update_activity_logs_updated_at ON activity_logs;
      CREATE TRIGGER trigger_update_activity_logs_updated_at
        BEFORE UPDATE ON activity_logs
        FOR EACH ROW
        EXECUTE FUNCTION update_activity_logs_updated_at();
    `
    
    await client.query(createTrigger)
    console.log('✅ Update trigger created')

    console.log('=== ACTIVITY LOGS TABLE CREATED SUCCESSFULLY ===')
  } catch (error) {
    console.error('❌ Error creating activity logs table:', error)
  } finally {
    await client.end()
  }
}

createLogsTable()
