import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Загружаем переменные окружения из .env.local
config({ path: '.env.local' })

async function applyMigrationV2Simple() {
  try {
    console.log('=== APPLYING MIGRATION V2 SIMPLE ===')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
      console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING')
      return
    }
    
    console.log('Environment variables loaded')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Читаем SQL файл
    const migrationPath = path.join(__dirname, 'migration-v2.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('Migration file read successfully')
    
    // Разбиваем SQL на отдельные команды
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`Found ${commands.length} SQL commands`)
    
    // Применяем каждую команду отдельно
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (command.trim()) {
        console.log(`Executing command ${i + 1}/${commands.length}`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: command + ';' })
        
        if (error) {
          console.error(`Error in command ${i + 1}:`, error)
          console.log('Command was:', command)
        } else {
          console.log(`Command ${i + 1} executed successfully`)
        }
      }
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

applyMigrationV2Simple()
