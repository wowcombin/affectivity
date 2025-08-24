import { Client } from 'pg'

async function createTestData() {
  const client = new Client({
    connectionString: "postgres://postgres.izjneklmbzgaihvwgwqx:CbJyOhauEs8QMVtD@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require",
    ssl: false
  })

  try {
    console.log('=== CREATING TEST DATA ===')
    
    await client.connect()
    console.log('Connected to database')
    
    // Получаем первый банк
    const { rows: banks } = await client.query('SELECT * FROM banks LIMIT 1')
    
    if (banks.length === 0) {
      console.log('No banks found, creating test bank...')
      const { rows: newBank } = await client.query(`
        INSERT INTO banks (name, type) VALUES ('Test Bank', 'uk') RETURNING *
      `)
      console.log('Test bank created:', newBank[0])
    }
    
    // Создаем тестовый банковский аккаунт
    console.log('Creating test bank account...')
    const { rows: account } = await client.query(`
      INSERT INTO bank_accounts (
        bank_id, 
        account_name, 
        account_number, 
        sort_code, 
        login_url, 
        login_password
      ) VALUES (
        '${banks[0]?.id || 'test-bank-id'}', 
        'Test Account', 
        '12345678', 
        '12-34-56', 
        'https://testbank.com/login', 
        'test123'
      ) RETURNING *
    `)
    console.log('Test account created:', account[0])
    
    // Создаем тестовые карты
    console.log('Creating test cards...')
    const { rows: cards } = await client.query(`
      INSERT INTO cards (
        bank_account_id,
        card_number,
        expiry_date,
        cvv,
        card_type,
        status
      ) VALUES 
        ('${account[0].id}', '4111111111111111', '12/25', '123', 'pink', 'free'),
        ('${account[0].id}', '4222222222222222', '12/26', '456', 'gray', 'free')
      RETURNING *
    `)
    console.log('Test cards created:', cards)
    
    console.log('=== TEST DATA CREATED SUCCESSFULLY ===')
    
  } catch (error) {
    console.error('Error creating test data:', error)
  } finally {
    await client.end()
    console.log('Database connection closed')
  }
}

createTestData()
