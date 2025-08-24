import { Client } from 'pg'

async function createTestEmployees() {
  const client = new Client({
    connectionString: "postgres://postgres.izjneklmbzgaihvwgwqx:CbJyOhauEs8QMVtD@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require",
    ssl: false
  })

  try {
    console.log('=== CREATING TEST EMPLOYEES ===')
    
    await client.connect()
    console.log('Connected to database')
    
    // Получаем существующих пользователей
    const { rows: users } = await client.query('SELECT id FROM users WHERE role IN (\'Employee\', \'Manager\', \'CFO\') LIMIT 3')
    
    if (users.length === 0) {
      console.log('No users found. Cannot create employees.')
      return
    }
    
    console.log('Creating test employees...')
    for (const user of users) {
      const { rows: existingEmployee } = await client.query('SELECT id FROM employees WHERE user_id = $1', [user.id])
      
      if (existingEmployee.length === 0) {
        const { rows: employee } = await client.query(`
          INSERT INTO employees (
            user_id,
            percentage_rate,
            total_profit,
            is_active
          ) VALUES ($1, $2, $3, $4) RETURNING *
        `, [user.id, 10.0, 0.0, true])
        
        console.log('Employee created:', employee[0])
      } else {
        console.log('Employee already exists for user:', user.id)
      }
    }
    
    console.log('=== TEST EMPLOYEES CREATED SUCCESSFULLY ===')
    
  } catch (error) {
    console.error('Error creating test employees:', error)
  } finally {
    await client.end()
    console.log('Database connection closed')
  }
}

createTestEmployees()
