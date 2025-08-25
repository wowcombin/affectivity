import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth'
import { logActivity } from '@/lib/auth'
import { z } from 'zod'

const cardDataSchema = z.object({
  card_number: z.string(),
  expiry_date: z.string(),
  cvv: z.string(),
  card_type: z.enum(['pink', 'gray']),
  status: z.enum(['free', 'assigned', 'in_process', 'completed']).default('free'),
  notes: z.string().optional()
})

const bankAccountDataSchema = z.object({
  account_name: z.string(),
  account_number: z.string(),
  sort_code: z.string(),
  login_url: z.string(),
  login_password: z.string(),
  pink_cards_daily_limit: z.number().default(5),
  cards: z.array(cardDataSchema)
})

const bulkImportSchema = z.object({
  bank_name: z.string(),
  bank_country: z.string(),
  bank_currency: z.string().default('GBP'),
  accounts: z.array(bankAccountDataSchema)
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== BULK IMPORT BANKS API CALLED ===')
    
    // Проверяем аутентификацию
    let authToken = request.cookies.get('auth-token')?.value
    
    if (!authToken) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7)
      }
    }

    if (!authToken) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 })
    }

    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = createClient()
    
    // Получаем данные пользователя
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем права доступа (только Admin и CFO)
    if (!['Admin', 'CFO'].includes((currentUser as any)?.role || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = bulkImportSchema.parse(body)

    // Создаем банк
    const { data: bank, error: bankError } = await supabase
      .from('banks')
      .insert({
        name: validatedData.bank_name,
        country: validatedData.bank_country
      } as any)
      .select()
      .single()

    if (bankError || !bank) {
      console.error('Error creating bank:', bankError)
      return NextResponse.json({ error: 'Failed to create bank' }, { status: 500 })
    }

    const bankData = bank as any

    let totalCardsCreated = 0
    let totalAccountsCreated = 0

    // Создаем аккаунты и карты
    for (const accountData of validatedData.accounts) {
      // Создаем банковский аккаунт
      const { data: bankAccount, error: accountError } = await supabase
        .from('bank_accounts')
        .insert({
          bank_id: bankData.id,
          account_name: accountData.account_name,
          account_number: accountData.account_number,
          sort_code: accountData.sort_code,
          login_url: accountData.login_url,
          login_password: accountData.login_password,
          pink_cards_daily_limit: accountData.pink_cards_daily_limit,
          pink_cards_remaining: accountData.pink_cards_daily_limit,
          last_reset_date: new Date().toISOString()
        } as any)
        .select()
        .single()

      if (accountError || !bankAccount) {
        console.error('Error creating bank account:', accountError)
        continue
      }

      const accountDataTyped = bankAccount as any

      totalAccountsCreated++

      // Создаем карты для этого аккаунта
      for (const cardData of accountData.cards) {
        const { error: cardError } = await supabase
          .from('cards')
          .insert({
            bank_account_id: accountDataTyped.id,
            card_number: cardData.card_number,
            expiry_date: cardData.expiry_date,
            cvv: cardData.cvv,
            card_type: cardData.card_type,
            status: cardData.status
          } as any)

        if (cardError) {
          console.error('Error creating card:', cardError)
        } else {
          totalCardsCreated++
        }
      }
    }

    // Логируем активность
    await logActivity(
      decoded.userId,
      'bulk_import_banks',
      { 
        user_role: (currentUser as any)?.role || 'Unknown',
        bank_name: validatedData.bank_name,
        accounts_created: totalAccountsCreated,
        cards_created: totalCardsCreated
      },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true,
      message: `Successfully imported ${validatedData.bank_name}`,
      data: {
        bank_id: bankData.id,
        accounts_created: totalAccountsCreated,
        cards_created: totalCardsCreated
      }
    })

  } catch (error) {
    console.error('Error in POST /api/banks/bulk-import:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
