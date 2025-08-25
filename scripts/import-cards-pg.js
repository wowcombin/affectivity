const { Client } = require('pg')

const connectionString = 'postgres://postgres.izjneklmbzgaihvwgwqx:CbJyOhauEs8QMVtD@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x'

// Структурированные данные банков и карт
const banksData = [
  {
    name: 'Georgina Brook',
    sort_code: '23-01-20',
    account_number: '49394661',
    login_url: 'https://my.duoplus.net/share?id=Nu0ma',
    login_password: 'gK1UFymb',
    bank_address: '16 Sunnybank Drive, SK9 6DY, Wilmslow, United Kingdom',
    cards: [
      { card_number: '4165490317741318', expiry_date: '08/30', cvv: '101' }
    ]
  },
  {
    name: 'Steven Paul Thompson',
    sort_code: '23-01-20',
    account_number: '50975703',
    login_url: 'https://my.duoplus.net/share?id=vOjWs',
    login_password: '9sWYLHlu',
    bank_address: 'Unit 11, Selby Business Park, YO8 8LZ, Selby, United Kingdom',
    cards: [
      { card_number: '4165490365359112', expiry_date: '08/30', cvv: '751' },
      { card_number: '4165490346209824', expiry_date: '08/30', cvv: '503' },
      { card_number: '4165490375488216', expiry_date: '08/30', cvv: '056' },
      { card_number: '4165490375281462', expiry_date: '08/30', cvv: '121' }
    ]
  },
  // ... остальные данные пропущены для краткости
]

async function importData() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  console.log('🚀 Начинаем импорт данных...\n')

  try {
    await client.connect()
    console.log('✅ Подключение к базе данных успешно!\n')

    // Начинаем транзакцию
    await client.query('BEGIN')

    // Шаг 1: Удаляем существующие карты (кроме уже назначенных)
    console.log('🗑️  Удаление свободных карт...')
    const deleteResult = await client.query(`
      DELETE FROM cards 
      WHERE status = 'free'
    `)
    console.log(`  Удалено карт: ${deleteResult.rowCount}`)

    // Шаг 2: Проверяем/создаем банк UK
    console.log('\n🏦 Проверка банка UK...')
    let bankId
    const bankCheck = await client.query(`
      SELECT id FROM banks WHERE country = 'UK' LIMIT 1
    `)
    
    if (bankCheck.rows.length > 0) {
      bankId = bankCheck.rows[0].id
      console.log(`  Банк UK уже существует: ${bankId}`)
    } else {
      const bankInsert = await client.query(`
        INSERT INTO banks (name, country, currency)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['UK Banks', 'UK', 'GBP'])
      bankId = bankInsert.rows[0].id
      console.log(`  Создан новый банк UK: ${bankId}`)
    }

    // Шаг 3: Создаем банковские аккаунты и карты
    let totalAccounts = 0
    let totalCards = 0

    for (const accountData of banksData.slice(0, 3)) { // Импортируем только первые 3 для теста
      console.log(`\n📁 Создание аккаунта: ${accountData.name}`)

      // Создаем банковский аккаунт
      const accountResult = await client.query(`
        INSERT INTO bank_accounts (
          bank_id, account_name, account_number, sort_code,
          login_url, login_password, bank_address,
          pink_cards_daily_limit, pink_cards_remaining
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        bankId, accountData.name, accountData.account_number,
        accountData.sort_code, accountData.login_url,
        accountData.login_password, accountData.bank_address,
        5, 5
      ])
      
      const accountId = accountResult.rows[0].id
      totalAccounts++
      console.log(`  ✅ Аккаунт создан`)

      // Создаем карты для этого аккаунта
      for (const card of accountData.cards) {
        await client.query(`
          INSERT INTO cards (
            bank_account_id, card_number, expiry_date, cvv,
            card_type, status
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          accountId, card.card_number, card.expiry_date,
          card.cvv, 'gray', 'free'
        ])
        totalCards++
      }
      console.log(`  ✅ Создано ${accountData.cards.length} карт`)
    }

    // Фиксируем транзакцию
    await client.query('COMMIT')
    
    console.log('\n' + '='.repeat(50))
    console.log('📊 ИТОГИ ИМПОРТА:')
    console.log(`✅ Создано ${totalAccounts} банковских аккаунтов`)
    console.log(`✅ Создано ${totalCards} карт`)
    console.log('='.repeat(50))

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Ошибка:', error.message)
  } finally {
    await client.end()
    console.log('\n🔚 Соединение закрыто')
  }
}

// Запускаем импорт
importData()
