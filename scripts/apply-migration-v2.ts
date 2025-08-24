import 'dotenv/config'
import { createAdminClient } from '../lib/supabase/admin'
import * as fs from 'fs'
import * as path from 'path'

async function applyMigrationV2() {
  try {
    console.log('=== APPLYING MIGRATION V2 ===')
    
    const supabase = createAdminClient()
    
    // Читаем SQL файл
    const migrationPath = path.join(__dirname, 'migration-v2.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('Migration file read successfully')
    
    // Применяем миграцию
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('Error applying migration:', error)
      return
    }
    
    console.log('Migration V2 applied successfully!')
    
    // Проверяем, что таблицы созданы
    const { data: banks, error: banksError } = await supabase
      .from('banks')
      .select('*')
      .limit(1)
    
    if (banksError) {
      console.error('Error checking banks table:', banksError)
    } else {
      console.log('Banks table exists and is accessible')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyMigrationV2()
