const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://izjneklmbzgaihvwgwqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodndnd3F4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk2ODU2MSwiZXhwIjoyMDUwNTQ0NTYxfQ.7vWrzOxIa6FdYZRKNVN2TXIEBu5hJT64UgLNUGnsUBw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigrations() {
  console.log('Применение миграций к базе данных...\n')

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const files = fs.readdirSync(migrationsDir).sort()

  for (const file of files) {
    if (!file.endsWith('.sql')) continue

    console.log(`\n📄 Применение миграции: ${file}`)
    
    try {
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      // Разбиваем SQL на отдельные команды
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0)
      
      console.log(`   Найдено команд: ${commands.length}`)
      
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i]
        
        // Пропускаем комментарии
        if (command.startsWith('--') || command.length === 0) continue
        
        // Выполняем команду через RPC
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: command + ';'
        }).catch(err => {
          // Если RPC не существует, пробуем через прямой запрос
          return { data: null, error: err }
        })
        
        if (error) {
          // Игнорируем ошибки о существующих объектах
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('duplicate key') ||
            error.message.includes('relation') && error.message.includes('already exists')
          )) {
            console.log(`   ⚠️  Команда ${i + 1}: Объект уже существует (пропускаем)`)
          } else {
            console.error(`   ❌ Команда ${i + 1}: Ошибка - ${error.message || 'Неизвестная ошибка'}`)
            // Продолжаем с другими командами
          }
        } else {
          console.log(`   ✅ Команда ${i + 1}: Успешно`)
        }
      }
      
    } catch (err) {
      console.error(`   ❌ Ошибка чтения файла: ${err.message}`)
    }
  }
  
  console.log('\n✅ Миграции завершены!')
}

applyMigrations()



