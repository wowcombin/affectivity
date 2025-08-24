import { Client } from 'pg'

async function createTestTransactions() {
  const client = new Client({
    connectionString: "postgres://postgres.izjneklmbzgaihvwgwqx:CbJyOhauEs8QMVtD@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require",
    ssl: false
  })

  try {
    console.log('=== CREATING TEST TRANSACTIONS ===')
    
    await client.connect()
    console.log('Connected to database')
    
    // Получаем существующие данные
    const { rows: employees } = await client.query('SELECT id FROM employees LIMIT 1')
    const { rows: cards } = await client.query('SELECT id FROM cards LIMIT 1')
    const { rows: casinos } = await client.query('SELECT id FROM casinos LIMIT 1')
    
    if (employees.length === 0 || cards.length === 0 || casinos.length === 0) {
      console.log('No employees, cards, or casinos found. Cannot create transactions.')
      return
    }
    
    console.log('Creating test transactions...')
    const { rows: transactions } = await client.query(`
      INSERT INTO transactions (
        employee_id,
        card_id,
        casino_id,
        transaction_type,
        amount,
        profit,
        status,
        transaction_date,
        notes
      ) VALUES 
        ('${employees[0].id}', '${cards[0].id}', '${casinos[0].id}', 'deposit', 1000.00, 50.00, 'completed', NOW(), 'Test deposit transaction'),
        ('${employees[0].id}', '${cards[0].id}', '${casinos[0].id}', 'withdrawal', 500.00, 25.00, 'completed', NOW(), 'Test withdrawal transaction'),
        ('${employees[0].id}', '${cards[0].id}', '${casinos[0].id}', 'deposit', 2000.00, 100.00, 'pending', NOW(), 'Test pending transaction')
      RETURNING *
    `)
    console.log('Test transactions created:', transactions)
    
    console.log('=== TEST TRANSACTIONS CREATED SUCCESSFULLY ===')
    
  } catch (error) {
    console.error('Error creating test transactions:', error)
  } finally {
    await client.end()
    console.log('Database connection closed')
  }
}

createTestTransactions()
