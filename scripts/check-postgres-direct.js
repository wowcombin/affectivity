const { Client } = require('pg')

// Прямое подключение к PostgreSQL
const connectionString = 'postgres://postgres.izjneklmbzgaihvwgwqx:CbJyOhauEs8QMVtD@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x'

async function checkDatabase() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🔗 Подключаемся к PostgreSQL напрямую...\n')
    await client.connect()
    console.log('✅ Подключение успешно!\n')

    // Проверяем какие таблицы существуют
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    
    const result = await client.query(tablesQuery)
    
    console.log(`📋 Найдено таблиц: ${result.rows.length}\n`)
    
    if (result.rows.length > 0) {
      console.log('Существующие таблицы:')
      result.rows.forEach(row => {
        console.log(`  ✅ ${row.table_name}`)
      })
    } else {
      console.log('❌ Таблицы не найдены! База данных пустая.')
    }

    // Проверяем структуру таблицы cards, если она существует
    const cardsExist = result.rows.some(row => row.table_name === 'cards')
    if (cardsExist) {
      console.log('\n📊 Структура таблицы cards:')
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'cards'
        ORDER BY ordinal_position;
      `
      const columnsResult = await client.query(columnsQuery)
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`)
      })

      // Подсчитываем карты
      const countQuery = 'SELECT COUNT(*) FROM cards;'
      const countResult = await client.query(countQuery)
      console.log(`\n  Всего карт: ${countResult.rows[0].count}`)
    }

  } catch (err) {
    console.error('❌ Ошибка:', err.message)
  } finally {
    await client.end()
    console.log('\n🔚 Соединение закрыто')
  }
}

checkDatabase()
