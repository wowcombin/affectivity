const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Инициализация Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения для Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Данные карт для каждого аккаунта
const cardsData = {
  "Georgina Brook": [
    {
      card_number: "4165490317741318",
      expiry_date: "08/30",
      cvv: "101",
      card_type: "gray",
      status: "free"
    }
  ],
  "Steven Paul Thompson": [
    {
      card_number: "4165490365359112",
      expiry_date: "08/30",
      cvv: "751",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490346209824",
      expiry_date: "08/30",
      cvv: "503",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490375488216",
      expiry_date: "08/30",
      cvv: "056",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490375281462",
      expiry_date: "08/30",
      cvv: "121",
      card_type: "gray",
      status: "free"
    }
  ],
  "Benjamin Bradbury": [
    {
      card_number: "5354567967473413",
      expiry_date: "08/30",
      cvv: "468",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "4165490362297299",
      expiry_date: "08/30",
      cvv: "204",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490327432916",
      expiry_date: "08/30",
      cvv: "759",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490328445594",
      expiry_date: "08/30",
      cvv: "914",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947901429795",
      expiry_date: "08/30",
      cvv: "250",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947920260841",
      expiry_date: "08/30",
      cvv: "864",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947970350849",
      expiry_date: "08/30",
      cvv: "239",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947940069313",
      expiry_date: "08/30",
      cvv: "990",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947920300845",
      expiry_date: "08/30",
      cvv: "758",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947960276004",
      expiry_date: "08/30",
      cvv: "258",
      card_type: "gray",
      status: "free"
    }
  ],
  "Okkes Toprak": [
    {
      card_number: "4165490356063152",
      expiry_date: "08/30",
      cvv: "162",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "4165490316251640",
      expiry_date: "08/30",
      cvv: "032",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490375383482",
      expiry_date: "08/30",
      cvv: "497",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490289732881",
      expiry_date: "08/30",
      cvv: "303",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947980664940",
      expiry_date: "08/30",
      cvv: "109",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947990215832",
      expiry_date: "08/30",
      cvv: "132",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947941216863",
      expiry_date: "08/30",
      cvv: "707",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947930959846",
      expiry_date: "08/30",
      cvv: "377",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947971160478",
      expiry_date: "08/30",
      cvv: "176",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947971100185",
      expiry_date: "08/30",
      cvv: "099",
      card_type: "gray",
      status: "free"
    }
  ],
  "Vishal Anand": [
    {
      card_number: "5354567977923654",
      expiry_date: "08/30",
      cvv: "782",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "4165490336913625",
      expiry_date: "08/30",
      cvv: "114",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490373395447",
      expiry_date: "08/30",
      cvv: "648",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490328435827",
      expiry_date: "08/30",
      cvv: "704",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947950225110",
      expiry_date: "08/30",
      cvv: "905",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947960439404",
      expiry_date: "08/30",
      cvv: "264",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947980422901",
      expiry_date: "08/30",
      cvv: "920",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947900616848",
      expiry_date: "08/30",
      cvv: "376",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947940651334",
      expiry_date: "08/30",
      cvv: "258",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947902236058",
      expiry_date: "08/30",
      cvv: "715",
      card_type: "gray",
      status: "free"
    }
  ],
  "Adrian Edward Doyle": [
    {
      card_number: "4165490328362484",
      expiry_date: "08/30",
      cvv: "082",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "4165490336822859",
      expiry_date: "08/30",
      cvv: "643",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490345374348",
      expiry_date: "08/30",
      cvv: "028",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490374839807",
      expiry_date: "08/30",
      cvv: "021",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947902310655",
      expiry_date: "08/30",
      cvv: "761",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947981053622",
      expiry_date: "08/30",
      cvv: "354",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947930220561",
      expiry_date: "08/30",
      cvv: "695",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947970166245",
      expiry_date: "08/30",
      cvv: "684",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947920430170",
      expiry_date: "08/30",
      cvv: "147",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947901497123",
      expiry_date: "08/30",
      cvv: "116",
      card_type: "gray",
      status: "free"
    }
  ],
  "Hieu Trung Nguyen": [
    {
      card_number: "5354567967927566",
      expiry_date: "08/30",
      cvv: "817",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "4165490336846809",
      expiry_date: "08/30",
      cvv: "388",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490356103008",
      expiry_date: "08/30",
      cvv: "507",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490346123546",
      expiry_date: "08/30",
      cvv: "659",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947970177416",
      expiry_date: "08/30",
      cvv: "507",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947920588803",
      expiry_date: "08/30",
      cvv: "812",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947990389066",
      expiry_date: "08/30",
      cvv: "713",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947980537948",
      expiry_date: "08/30",
      cvv: "219",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947980689533",
      expiry_date: "08/30",
      cvv: "849",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947961204617",
      expiry_date: "08/30",
      cvv: "398",
      card_type: "gray",
      status: "free"
    }
  ],
  "Phu Van Le": [
    {
      card_number: "5354567958008483",
      expiry_date: "08/30",
      cvv: "958",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "4165490318413727",
      expiry_date: "08/30",
      cvv: "534",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490381925060",
      expiry_date: "08/30",
      cvv: "653",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490336731217",
      expiry_date: "08/30",
      cvv: "893",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947920428109",
      expiry_date: "08/30",
      cvv: "453",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947960344083",
      expiry_date: "08/30",
      cvv: "432",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947910259605",
      expiry_date: "08/30",
      cvv: "364",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947931167027",
      expiry_date: "08/30",
      cvv: "344",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947971252424",
      expiry_date: "08/30",
      cvv: "601",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947901849463",
      expiry_date: "08/30",
      cvv: "715",
      card_type: "gray",
      status: "free"
    }
  ],
  "John Matthew Scrowston": [
    {
      card_number: "5354567937410115",
      expiry_date: "08/30",
      cvv: "816",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567917332065",
      expiry_date: "08/30",
      cvv: "343",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567936175743",
      expiry_date: "08/30",
      cvv: "829",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567961442638",
      expiry_date: "08/30",
      cvv: "264",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5167947960943694",
      expiry_date: "08/30",
      cvv: "533",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947990677163",
      expiry_date: "08/30",
      cvv: "708",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947970404943",
      expiry_date: "08/30",
      cvv: "599",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947901486993",
      expiry_date: "08/30",
      cvv: "345",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947910891340",
      expiry_date: "08/30",
      cvv: "415",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "5167947940772189",
      expiry_date: "08/30",
      cvv: "462",
      card_type: "gray",
      status: "free"
    }
  ],
  "Oliver James Bloom": [
    {
      card_number: "5354567928026250",
      expiry_date: "08/30",
      cvv: "826",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567983660613",
      expiry_date: "08/30",
      cvv: "733",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567967385161",
      expiry_date: "08/30",
      cvv: "063",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567967708032",
      expiry_date: "08/30",
      cvv: "442",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "4165490336790130",
      expiry_date: "08/30",
      cvv: "260",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490317909428",
      expiry_date: "08/30",
      cvv: "354",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490365375068",
      expiry_date: "08/30",
      cvv: "508",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490345938464",
      expiry_date: "08/30",
      cvv: "361",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490346060466",
      expiry_date: "08/30",
      cvv: "715",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490381567193",
      expiry_date: "08/30",
      cvv: "789",
      card_type: "gray",
      status: "free"
    }
  ],
  "Isha Imani": [
    {
      card_number: "5354567956989197",
      expiry_date: "07/30",
      cvv: "379",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567997668982",
      expiry_date: "08/30",
      cvv: "928",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567947545819",
      expiry_date: "08/30",
      cvv: "223",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567937660602",
      expiry_date: "08/30",
      cvv: "403",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "4165490317970115",
      expiry_date: "08/30",
      cvv: "715",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490375105620",
      expiry_date: "08/30",
      cvv: "046",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490328160201",
      expiry_date: "08/30",
      cvv: "320",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490336617242",
      expiry_date: "08/30",
      cvv: "604",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490381737606",
      expiry_date: "08/30",
      cvv: "320",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490336614520",
      expiry_date: "08/30",
      cvv: "597",
      card_type: "gray",
      status: "free"
    }
  ],
  "Zenah Zghaibeh": [
    {
      card_number: "5354567917023672",
      expiry_date: "08/30",
      cvv: "989",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567995896171",
      expiry_date: "08/30",
      cvv: "930",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567997820096",
      expiry_date: "08/30",
      cvv: "052",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "5354567937113107",
      expiry_date: "08/30",
      cvv: "920",
      card_type: "pink",
      status: "free"
    },
    {
      card_number: "4165490318271752",
      expiry_date: "08/30",
      cvv: "467",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490345044123",
      expiry_date: "08/30",
      cvv: "599",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490356063400",
      expiry_date: "08/30",
      cvv: "200",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490343354516",
      expiry_date: "08/30",
      cvv: "776",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490374530323",
      expiry_date: "08/30",
      cvv: "956",
      card_type: "gray",
      status: "free"
    },
    {
      card_number: "4165490345663161",
      expiry_date: "08/30",
      cvv: "690",
      card_type: "gray",
      status: "free"
    }
  ]
}

async function addCardsToRevolutAccounts() {
  try {
    console.log('🚀 Начинаем добавление карт к аккаунтам Revolut...')
    
    // Получаем банк Revolut
    const { data: bank, error: bankError } = await supabase
      .from('banks')
      .select('*')
      .eq('name', 'Revolut')
      .single()

    if (bankError || !bank) {
      console.error('❌ Банк Revolut не найден:', bankError)
      return
    }

    console.log('✅ Найден банк Revolut:', bank.name)

    let totalCardsCreated = 0

    // Проходим по всем аккаунтам и добавляем карты
    for (const [accountName, cards] of Object.entries(cardsData)) {
      console.log(`📝 Добавляем карты для аккаунта: ${accountName}`)
      
      // Находим аккаунт
      const { data: account, error: accountError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('bank_id', bank.id)
        .eq('account_name', accountName)
        .single()

      if (accountError || !account) {
        console.error(`❌ Аккаунт ${accountName} не найден:`, accountError)
        continue
      }

      console.log(`✅ Найден аккаунт: ${account.account_name}`)

      // Добавляем карты
      for (const cardData of cards) {
        const { error: cardError } = await supabase
          .from('cards')
          .insert({
            bank_account_id: account.id,
            card_number: cardData.card_number,
            expiry_date: cardData.expiry_date,
            cvv: cardData.cvv,
            card_type: cardData.card_type,
            status: cardData.status
          })

        if (cardError) {
          console.error(`❌ Ошибка создания карты ${cardData.card_number}:`, cardError)
        } else {
          totalCardsCreated++
          console.log(`✅ Создана карта: ${cardData.card_number} (${cardData.card_type})`)
        }
      }

      console.log(`✅ Добавлено карт для ${accountName}: ${cards.length}`)
    }

    console.log('\n🎉 Добавление карт завершено!')
    console.log(`📊 Статистика:`)
    console.log(`   - Всего карт создано: ${totalCardsCreated}`)
    console.log(`   - Розовых карт: ${Object.values(cardsData).flat().filter(card => card.card_type === 'pink').length}`)
    console.log(`   - Серых карт: ${Object.values(cardsData).flat().filter(card => card.card_type === 'gray').length}`)

  } catch (error) {
    console.error('❌ Ошибка при добавлении карт:', error)
  }
}

// Запускаем добавление карт
addCardsToRevolutAccounts()
