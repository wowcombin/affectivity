const fs = require('fs')
const path = require('path')

// Данные Revolut UK
const revolutData = {
  bank_name: "Revolut",
  bank_country: "UK",
  bank_currency: "GBP",
  accounts: [
    {
      account_name: "Georgina Brook",
      account_number: "49394661",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=Nu0ma",
      login_password: "gK1UFymb",
      pink_cards_daily_limit: 5,
      cards: [
        {
          card_number: "4165490317741318",
          expiry_date: "08/30",
          cvv: "101",
          card_type: "gray",
          status: "free",
          notes: "16 Sunnybank Drive, SK9 6DY, Wilmslow, United Kingdom"
        }
      ]
    },
    {
      account_name: "Steven Paul Thompson",
      account_number: "50975703",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=vOjWs",
      login_password: "9sWYLHlu",
      pink_cards_daily_limit: 5,
      cards: [
        {
          card_number: "4165490365359112",
          expiry_date: "08/30",
          cvv: "751",
          card_type: "gray",
          status: "free",
          notes: "Unit 11, Selby Business Park, YO8 8LZ, Selby, United Kingdom"
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
      ]
    },
    {
      account_name: "Benjamin Bradbury",
      account_number: "65912991",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=hpmGA",
      login_password: "tVHha8Kq",
      pink_cards_daily_limit: 5,
      cards: [
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
          status: "free",
          notes: "101 Deepcut Bridge Road, GU16 6SD, Camberley"
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
      ]
    },
    {
      account_name: "Okkes Toprak",
      account_number: "53211645",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=oY1nw",
      login_password: "2THRPqaI",
      pink_cards_daily_limit: 5,
      cards: [
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
          status: "free",
          notes: "25 Streatham High Road, SW16 1EX, London"
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
      ]
    },
    {
      account_name: "Vishal Anand",
      account_number: "63967809",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=xs2F3",
      login_password: "gl4cqI6o",
      pink_cards_daily_limit: 5,
      cards: [
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
          status: "free",
          notes: "2 Valley Road, SK8 1HY, Cheadle"
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
      ]
    },
    {
      account_name: "Adrian Edward Doyle",
      account_number: "60790323",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=jAgvF",
      login_password: "5PNN2lkf",
      pink_cards_daily_limit: 5,
      cards: [
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
          status: "free",
          notes: "56 Grove St, S71 1EU, Barnsley"
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
      ]
    },
    {
      account_name: "Hieu Trung Nguyen",
      account_number: "62024526",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=83m0q",
      login_password: "dnVAaP52",
      pink_cards_daily_limit: 5,
      cards: [
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
          status: "free",
          notes: "22 Walter St, CH1 3JQ, Chester, United Kingdom"
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
      ]
    },
    {
      account_name: "Phu Van Le",
      account_number: "34025265",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=YK6Sc",
      login_password: "fFnx8XnS",
      pink_cards_daily_limit: 5,
      cards: [
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
          status: "free",
          notes: "77 High St, IV30 1EA, Elgin, United Kingdom"
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
      ]
    },
    {
      account_name: "John Matthew Scrowston",
      account_number: "40339965",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=tkeJY",
      login_password: "tDO4hTRK",
      pink_cards_daily_limit: 5,
      cards: [
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
          status: "free",
          notes: "1 Elms Drive, HU10 7QH, Hull, United Kingdom"
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
          status: "free",
          notes: "Apple Pay АNT"
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
      ]
    },
    {
      account_name: "Oliver James Bloom",
      account_number: "53146951",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=qE8ds",
      login_password: "O6iabRuX",
      pink_cards_daily_limit: 5,
      cards: [
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
          status: "free",
          notes: "27 Kenwardly Road, HU10 6LZ, Hull, United Kingdom"
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
          status: "free",
          notes: "Restrict 06/09"
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
      ]
    },
    {
      account_name: "Isha Imani",
      account_number: "30187793",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=ZaumH",
      login_password: "F7Y7aY9Y",
      pink_cards_daily_limit: 5,
      cards: [
        {
          card_number: "5354567956989197",
          expiry_date: "07/30",
          cvv: "379",
          card_type: "pink",
          status: "free",
          notes: "Apple Pay АNT"
        },
        {
          card_number: "5354567997668982",
          expiry_date: "08/30",
          cvv: "928",
          card_type: "pink",
          status: "free",
          notes: "M45 7HH, 7 Westlands, Manchester - Apple Pay АNT"
        },
        {
          card_number: "5354567947545819",
          expiry_date: "08/30",
          cvv: "223",
          card_type: "pink",
          status: "free",
          notes: "Apple Pay АNT"
        },
        {
          card_number: "5354567937660602",
          expiry_date: "08/30",
          cvv: "403",
          card_type: "pink",
          status: "free",
          notes: "Restrict 02/09"
        },
        {
          card_number: "4165490317970115",
          expiry_date: "08/30",
          cvv: "715",
          card_type: "gray",
          status: "free",
          notes: "Apple Pay YUR black"
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
      ]
    },
    {
      account_name: "Zenah Zghaibeh",
      account_number: "67802462",
      sort_code: "23-01-20",
      login_url: "https://my.duoplus.net/share?id=oYtFP",
      login_password: "u3WudWNW",
      pink_cards_daily_limit: 5,
      cards: [
        {
          card_number: "5354567917023672",
          expiry_date: "08/30",
          cvv: "989",
          card_type: "pink",
          status: "free",
          notes: "Apple Pay YUR gray"
        },
        {
          card_number: "5354567995896171",
          expiry_date: "08/30",
          cvv: "930",
          card_type: "pink",
          status: "free",
          notes: "МК6 2BB, 32 Pencarrow Place, Milton Keynes - Apple Pay YUR gray"
        },
        {
          card_number: "5354567997820096",
          expiry_date: "08/30",
          cvv: "052",
          card_type: "pink",
          status: "free",
          notes: "Apple Pay YUR gold"
        },
        {
          card_number: "5354567937113107",
          expiry_date: "08/30",
          cvv: "920",
          card_type: "pink",
          status: "free",
          notes: "Apple Pay YUR red"
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
  ]
}

// Сохраняем данные в JSON файл
const outputPath = path.join(__dirname, 'revolut-data.json')
fs.writeFileSync(outputPath, JSON.stringify(revolutData, null, 2))

console.log('✅ Данные Revolut UK сохранены в файл:', outputPath)
console.log(`📊 Статистика:`)
console.log(`   - Банковских аккаунтов: ${revolutData.accounts.length}`)
console.log(`   - Всего карт: ${revolutData.accounts.reduce((sum, acc) => sum + acc.cards.length, 0)}`)
console.log(`   - Розовых карт: ${revolutData.accounts.reduce((sum, acc) => sum + acc.cards.filter(card => card.card_type === 'pink').length, 0)}`)
console.log(`   - Серых карт: ${revolutData.accounts.reduce((sum, acc) => sum + acc.cards.filter(card => card.card_type === 'gray').length, 0)}`)

// Функция для отправки данных через API
async function importRevolutData() {
  try {
    const response = await fetch('http://localhost:3000/api/banks/bulk-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Замените на реальный токен
      },
      body: JSON.stringify(revolutData)
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Данные успешно импортированы!')
      console.log('📋 Результат:', result)
    } else {
      console.error('❌ Ошибка импорта:', result)
    }
  } catch (error) {
    console.error('❌ Ошибка при отправке данных:', error)
  }
}

// Экспортируем функцию для использования
module.exports = { revolutData, importRevolutData }

// Если скрипт запущен напрямую, показываем инструкции
if (require.main === module) {
  console.log('\n📝 Инструкции по импорту:')
  console.log('1. Убедитесь, что сервер запущен (npm run dev)')
  console.log('2. Получите токен авторизации (войдите в систему)')
  console.log('3. Замените YOUR_TOKEN_HERE на реальный токен в скрипте')
  console.log('4. Запустите функцию importRevolutData()')
  console.log('\n💡 Или используйте данные из revolut-data.json для ручного импорта через API')
}
