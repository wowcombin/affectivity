const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://izjneklmbzgaihvwgwqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodndnd3F4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk2ODU2MSwiZXhwIjoyMDUwNTQ0NTYxfQ.7vWrzOxIa6FdYZRKNVN2TXIEBu5hJT64UgLNUGnsUBw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCardsData() {
  console.log('Проверка данных карт...\n')

  try {
    // Проверяем количество карт
    const { count: totalCards, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Ошибка подсчета карт:', countError.message)
      return
    }
    
    console.log(`Общее количество карт в базе: ${totalCards}`)
    
    // Получаем примеры карт
    const { data: sampleCards, error: sampleError } = await supabase
      .from('cards')
      .select('*')
      .limit(3)
    
    if (sampleError) {
      console.error('Ошибка получения примеров карт:', sampleError.message)
      return
    }
    
    console.log('\nПримеры карт:')
    sampleCards.forEach((card, index) => {
      console.log(`\nКарта ${index + 1}:`)
      console.log(`  ID: ${card.id}`)
      console.log(`  Номер: ${card.card_number}`)
      console.log(`  Тип: ${card.card_type}`)
      console.log(`  Статус: ${card.status}`)
      console.log(`  Bank Account ID: ${card.bank_account_id}`)
    })
    
    // Проверяем связанные данные
    const { data: cardsWithRelations, error: relError } = await supabase
      .from('cards')
      .select(`
        *,
        bank_accounts (
          id,
          account_name,
          banks (
            id,
            name,
            country
          )
        )
      `)
      .limit(2)
    
    if (relError) {
      console.error('\nОшибка получения карт с отношениями:', relError.message)
    } else {
      console.log('\nКарты с банковскими данными:')
      cardsWithRelations.forEach((card, index) => {
        console.log(`\nКарта ${index + 1} с банком:`)
        console.log(`  Номер карты: ${card.card_number}`)
        console.log(`  Банковский аккаунт: ${card.bank_accounts?.account_name || 'N/A'}`)
        console.log(`  Банк: ${card.bank_accounts?.banks?.name || 'N/A'}`)
        console.log(`  Страна: ${card.bank_accounts?.banks?.country || 'N/A'}`)
      })
    }
    
    // Статистика по статусам
    const { data: allCards, error: allError } = await supabase
      .from('cards')
      .select('status')
    
    if (!allError && allCards) {
      const statusCount = {
        free: allCards.filter(c => c.status === 'free').length,
        assigned: allCards.filter(c => c.status === 'assigned').length,
        in_process: allCards.filter(c => c.status === 'in_process').length,
        completed: allCards.filter(c => c.status === 'completed').length
      }
      
      console.log('\nСтатистика по статусам:')
      console.log(`  Свободные: ${statusCount.free}`)
      console.log(`  Назначенные: ${statusCount.assigned}`)
      console.log(`  В процессе: ${statusCount.in_process}`)
      console.log(`  Завершенные: ${statusCount.completed}`)
    }
    
  } catch (error) {
    console.error('Произошла ошибка:', error.message)
  }
}

checkCardsData()



