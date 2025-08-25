const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://izjneklmbzgaihvwgwqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodnZnd3F4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDY3NiwiZXhwIjoyMDcxNTMwNjc2fQ.pB86kUf85lgLXmr0ZMaIxC4TOSAV3WjTuoAS69VNkss'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
  {
    name: 'Benjamin Bradbury',
    sort_code: '23-01-20',
    account_number: '65912991',
    login_url: 'https://my.duoplus.net/share?id=hpmGA',
    login_password: 'tVHha8Kq',
    bank_address: '101 Deepcut Bridge Road, GU16 6SD, Camberley',
    cards: [
      { card_number: '5354567967473413', expiry_date: '08/30', cvv: '468' },
      { card_number: '4165490362297299', expiry_date: '08/30', cvv: '204' },
      { card_number: '4165490327432916', expiry_date: '08/30', cvv: '759' },
      { card_number: '4165490328445594', expiry_date: '08/30', cvv: '914' },
      { card_number: '5167947901429795', expiry_date: '08/30', cvv: '250' },
      { card_number: '5167947920260841', expiry_date: '08/30', cvv: '864' },
      { card_number: '5167947970350849', expiry_date: '08/30', cvv: '239' },
      { card_number: '5167947940069313', expiry_date: '08/30', cvv: '990' },
      { card_number: '5167947920300845', expiry_date: '08/30', cvv: '758' },
      { card_number: '5167947960276004', expiry_date: '08/30', cvv: '258' }
    ]
  },
  {
    name: 'Okkes Toprak',
    sort_code: '23-01-20',
    account_number: '53211645',
    login_url: 'https://my.duoplus.net/share?id=oY1nw',
    login_password: '2THRPqaI',
    bank_address: '25 Streatham High Road, SW16 1EX, London',
    cards: [
      { card_number: '4165490356063152', expiry_date: '08/30', cvv: '162' },
      { card_number: '4165490316251640', expiry_date: '08/30', cvv: '032' },
      { card_number: '4165490375383482', expiry_date: '08/30', cvv: '497' },
      { card_number: '4165490289732881', expiry_date: '08/30', cvv: '303' },
      { card_number: '5167947980664940', expiry_date: '08/30', cvv: '109' },
      { card_number: '5167947990215832', expiry_date: '08/30', cvv: '132' },
      { card_number: '5167947941216863', expiry_date: '08/30', cvv: '707' },
      { card_number: '5167947930959846', expiry_date: '08/30', cvv: '377' },
      { card_number: '5167947971160478', expiry_date: '08/30', cvv: '176' },
      { card_number: '5167947971100185', expiry_date: '08/30', cvv: '099' }
    ]
  },
  {
    name: 'Vishal Anand',
    sort_code: '23-01-20',
    account_number: '63967809',
    login_url: 'https://my.duoplus.net/share?id=xs2F3',
    login_password: 'gl4cqI6o',
    bank_address: '2 Valley Road, SK8 1HY, Cheadle',
    cards: [
      { card_number: '5354567977923654', expiry_date: '08/30', cvv: '782' },
      { card_number: '4165490336913625', expiry_date: '08/30', cvv: '114' },
      { card_number: '4165490373395447', expiry_date: '08/30', cvv: '648' },
      { card_number: '4165490328435827', expiry_date: '08/30', cvv: '704' },
      { card_number: '5167947950225110', expiry_date: '08/30', cvv: '905' },
      { card_number: '5167947960439404', expiry_date: '08/30', cvv: '264' },
      { card_number: '5167947980422901', expiry_date: '08/30', cvv: '920' },
      { card_number: '5167947900616848', expiry_date: '08/30', cvv: '376' },
      { card_number: '5167947940651334', expiry_date: '08/30', cvv: '258' },
      { card_number: '5167947902236058', expiry_date: '08/30', cvv: '715' }
    ]
  },
  {
    name: 'Adrian Edward Doyle',
    sort_code: '23-01-20',
    account_number: '60790323',
    login_url: 'https://my.duoplus.net/share?id=jAgvF',
    login_password: '5PNN2lkf',
    bank_address: '56 Grove St, S71 1EU, Barnsley',
    cards: [
      { card_number: '4165490328362484', expiry_date: '08/30', cvv: '082' },
      { card_number: '4165490336822859', expiry_date: '08/30', cvv: '643' },
      { card_number: '4165490345374348', expiry_date: '08/30', cvv: '028' },
      { card_number: '4165490374839807', expiry_date: '08/30', cvv: '021' },
      { card_number: '5167947902310655', expiry_date: '08/30', cvv: '761' },
      { card_number: '5167947981053622', expiry_date: '08/30', cvv: '354' },
      { card_number: '5167947930220561', expiry_date: '08/30', cvv: '695' },
      { card_number: '5167947970166245', expiry_date: '08/30', cvv: '684' },
      { card_number: '5167947920430170', expiry_date: '08/30', cvv: '147' },
      { card_number: '5167947901497123', expiry_date: '08/30', cvv: '116' }
    ]
  },
  {
    name: 'Hieu Trung Nguyen',
    sort_code: '23-01-20',
    account_number: '62024526',
    login_url: 'https://my.duoplus.net/share?id=83m0q',
    login_password: 'dnVAaP52',
    bank_address: '22 Walter St, CH1 3JQ, Chester, United Kingdom',
    cards: [
      { card_number: '5354567967927566', expiry_date: '08/30', cvv: '817' },
      { card_number: '4165490336846809', expiry_date: '08/30', cvv: '388' },
      { card_number: '4165490356103008', expiry_date: '08/30', cvv: '507' },
      { card_number: '4165490346123546', expiry_date: '08/30', cvv: '659' },
      { card_number: '5167947970177416', expiry_date: '08/30', cvv: '507' },
      { card_number: '5167947920588803', expiry_date: '08/30', cvv: '812' },
      { card_number: '5167947990389066', expiry_date: '08/30', cvv: '713' },
      { card_number: '5167947980537948', expiry_date: '08/30', cvv: '219' },
      { card_number: '5167947980689533', expiry_date: '08/30', cvv: '849' },
      { card_number: '5167947961204617', expiry_date: '08/30', cvv: '398' }
    ]
  },
  {
    name: 'Phu Van Le',
    sort_code: '23-01-20',
    account_number: '34025265',
    login_url: 'https://my.duoplus.net/share?id=YK6Sc',
    login_password: 'fFnx8XnS',
    bank_address: '77 High St, IV30 1EA, Elgin, United Kingdom',
    cards: [
      { card_number: '5354567958008483', expiry_date: '08/30', cvv: '958' },
      { card_number: '4165490318413727', expiry_date: '08/30', cvv: '534' },
      { card_number: '4165490381925060', expiry_date: '08/30', cvv: '653' },
      { card_number: '4165490336731217', expiry_date: '08/30', cvv: '893' },
      { card_number: '5167947920428109', expiry_date: '08/30', cvv: '453' },
      { card_number: '5167947960344083', expiry_date: '08/30', cvv: '432' },
      { card_number: '5167947910259605', expiry_date: '08/30', cvv: '364' },
      { card_number: '5167947931167027', expiry_date: '08/30', cvv: '344' },
      { card_number: '5167947971252424', expiry_date: '08/30', cvv: '601' },
      { card_number: '5167947901849463', expiry_date: '08/30', cvv: '715' }
    ]
  },
  {
    name: 'John Matthew Scrowston',
    sort_code: '23-01-20',
    account_number: '40339965',
    login_url: 'https://my.duoplus.net/share?id=tkeJY',
    login_password: 'tDO4hTRK',
    bank_address: '1 Elms Drive, HU10 7QH, Hull, United Kingdom',
    cards: [
      { card_number: '5354567937410115', expiry_date: '08/30', cvv: '816' },
      { card_number: '5354567917332065', expiry_date: '08/30', cvv: '343' },
      { card_number: '5354567936175743', expiry_date: '08/30', cvv: '829' },
      { card_number: '5354567961442638', expiry_date: '08/30', cvv: '264' },
      { card_number: '5167947960943694', expiry_date: '08/30', cvv: '533' },
      { card_number: '5167947990677163', expiry_date: '08/30', cvv: '708' },
      { card_number: '5167947970404943', expiry_date: '08/30', cvv: '599' },
      { card_number: '5167947901486993', expiry_date: '08/30', cvv: '345' },
      { card_number: '5167947910891340', expiry_date: '08/30', cvv: '415' },
      { card_number: '5167947940772189', expiry_date: '08/30', cvv: '462' }
    ]
  },
  {
    name: 'Oliver James Bloom',
    sort_code: '23-01-20',
    account_number: '53146951',
    login_url: 'https://my.duoplus.net/share?id=qE8ds',
    login_password: 'O6iabRuX',
    bank_address: '27 Kenwardly Road, HU10 6LZ, Hull, United Kingdom',
    cards: [
      { card_number: '5354567928026250', expiry_date: '08/30', cvv: '826' },
      { card_number: '5354567983660613', expiry_date: '08/30', cvv: '733' },
      { card_number: '5354567967385161', expiry_date: '08/30', cvv: '063' },
      { card_number: '5354567967708032', expiry_date: '08/30', cvv: '442' },
      { card_number: '4165490336790130', expiry_date: '08/30', cvv: '260' },
      { card_number: '4165490317909428', expiry_date: '08/30', cvv: '354' },
      { card_number: '4165490365375068', expiry_date: '08/30', cvv: '508' },
      { card_number: '4165490345938464', expiry_date: '08/30', cvv: '361' },
      { card_number: '4165490346060466', expiry_date: '08/30', cvv: '715' },
      { card_number: '4165490381567193', expiry_date: '08/30', cvv: '789' }
    ]
  },
  {
    name: 'Isha Imani',
    sort_code: '23-01-20',
    account_number: '30187793',
    login_url: 'https://my.duoplus.net/share?id=ZaumH',
    login_password: 'F7Y7aY9Y',
    bank_address: 'M45 7HH, 7 Westlands, Manchester',
    cards: [
      { card_number: '5354567956989197', expiry_date: '07/30', cvv: '379' },
      { card_number: '5354567997668982', expiry_date: '08/30', cvv: '928' },
      { card_number: '5354567947545819', expiry_date: '08/30', cvv: '223' },
      { card_number: '5354567937660602', expiry_date: '08/30', cvv: '403' },
      { card_number: '4165490317970115', expiry_date: '08/30', cvv: '715' },
      { card_number: '4165490375105620', expiry_date: '08/30', cvv: '046' },
      { card_number: '4165490328160201', expiry_date: '08/30', cvv: '320' },
      { card_number: '4165490336617242', expiry_date: '08/30', cvv: '604' },
      { card_number: '4165490381737606', expiry_date: '08/30', cvv: '320' },
      { card_number: '4165490336614520', expiry_date: '08/30', cvv: '597' }
    ]
  },
  {
    name: 'Zenah Zghaibeh',
    sort_code: '23-01-20',
    account_number: '67802462',
    login_url: 'https://my.duoplus.net/share?id=oYtFP',
    login_password: 'u3WudWNW',
    bank_address: 'МК6 2BB, 32 Pencarrow Place, Milton Keynes',
    cards: [
      { card_number: '5354567917023672', expiry_date: '08/30', cvv: '989' },
      { card_number: '5354567995896171', expiry_date: '08/30', cvv: '930' },
      { card_number: '5354567997820096', expiry_date: '08/30', cvv: '052' },
      { card_number: '5354567937113107', expiry_date: '08/30', cvv: '920' },
      { card_number: '4165490318271752', expiry_date: '08/30', cvv: '467' },
      { card_number: '4165490345044123', expiry_date: '08/30', cvv: '599' },
      { card_number: '4165490356063400', expiry_date: '08/30', cvv: '200' },
      { card_number: '4165490343354516', expiry_date: '08/30', cvv: '776' },
      { card_number: '4165490374530323', expiry_date: '08/30', cvv: '956' },
      { card_number: '4165490345663161', expiry_date: '08/30', cvv: '690' }
    ]
  }
]

async function importData() {
  console.log('🚀 Начинаем импорт данных...\n')

  try {
    // Шаг 1: Удаляем все существующие карты
    console.log('🗑️  Удаление существующих карт...')
    const { error: deleteCardsError } = await supabase
      .from('cards')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Удаляем все записи
    
    if (deleteCardsError && !deleteCardsError.message.includes('relation "cards" does not exist')) {
      console.error('Ошибка при удалении карт:', deleteCardsError.message)
    }

    // Шаг 2: Удаляем все существующие банковские аккаунты
    console.log('🗑️  Удаление существующих банковских аккаунтов...')
    const { error: deleteAccountsError } = await supabase
      .from('bank_accounts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deleteAccountsError && !deleteAccountsError.message.includes('relation "bank_accounts" does not exist')) {
      console.error('Ошибка при удалении аккаунтов:', deleteAccountsError.message)
    }

    // Шаг 3: Удаляем все существующие банки
    console.log('🗑️  Удаление существующих банков...')
    const { error: deleteBanksError } = await supabase
      .from('banks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deleteBanksError && !deleteBanksError.message.includes('relation "banks" does not exist')) {
      console.error('Ошибка при удалении банков:', deleteBanksError.message)
    }

    console.log('\n✅ Старые данные удалены\n')

    // Шаг 4: Создаем банк UK (все банки из UK)
    console.log('🏦 Создание банка UK...')
    const bankData = {
      name: 'UK Banks',
      country: 'UK',
      currency: 'GBP'
    }

    const { data: bank, error: bankError } = await supabase
      .from('banks')
      .insert(bankData)
      .select()
      .single()

    if (bankError) {
      console.error('❌ Ошибка создания банка:', bankError.message)
      return
    }

    console.log('✅ Банк создан:', bank.name)

    // Шаг 5: Создаем банковские аккаунты и карты
    let totalAccounts = 0
    let totalCards = 0

    for (const accountData of banksData) {
      console.log(`\n📁 Создание аккаунта: ${accountData.name}`)

      // Создаем банковский аккаунт
      const account = {
        bank_id: bank.id,
        account_name: accountData.name,
        account_number: accountData.account_number,
        sort_code: accountData.sort_code,
        login_url: accountData.login_url,
        login_password: accountData.login_password,
        bank_address: accountData.bank_address,
        pink_cards_daily_limit: 5,
        pink_cards_remaining: 5,
        last_reset_date: new Date().toISOString()
      }

      const { data: bankAccount, error: accountError } = await supabase
        .from('bank_accounts')
        .insert(account)
        .select()
        .single()

      if (accountError) {
        console.error(`❌ Ошибка создания аккаунта ${accountData.name}:`, accountError.message)
        continue
      }

      totalAccounts++
      console.log(`✅ Аккаунт создан: ${accountData.name}`)

      // Создаем карты для этого аккаунта
      const cards = accountData.cards.map(card => ({
        bank_account_id: bankAccount.id,
        card_number: card.card_number,
        expiry_date: card.expiry_date,
        cvv: card.cvv,
        card_type: 'gray', // Все карты серые
        status: 'free',
        deposit_amount: 0,
        withdrawal_amount: 0,
        profit: 0
      }))

      const { data: createdCards, error: cardsError } = await supabase
        .from('cards')
        .insert(cards)
        .select()

      if (cardsError) {
        console.error(`❌ Ошибка создания карт для ${accountData.name}:`, cardsError.message)
      } else {
        totalCards += createdCards.length
        console.log(`✅ Создано ${createdCards.length} карт`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 ИТОГИ ИМПОРТА:')
    console.log(`✅ Создан 1 банк (UK)`)
    console.log(`✅ Создано ${totalAccounts} банковских аккаунтов`)
    console.log(`✅ Создано ${totalCards} карт`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message)
  }
}

// Запускаем импорт
importData()
