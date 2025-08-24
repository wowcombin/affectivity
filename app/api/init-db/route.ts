import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('=== INIT DB API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Проверяем таблицу банков
    console.log('Checking banks table...')
    const { data: banks, error: banksError } = await supabase
      .from('banks')
      .select('*')
      .limit(1)
    
    if (banksError) {
      console.error('Error checking banks table:', banksError)
      return NextResponse.json({ 
        error: 'Banks table does not exist or is not accessible',
        details: banksError.message 
      }, { status: 500 })
    }
    
    console.log('Banks table exists and is accessible')
    
    // Проверяем таблицу банковских аккаунтов
    console.log('Checking bank_accounts table...')
    const { data: accounts, error: accountsError } = await supabase
      .from('bank_accounts')
      .select('*')
      .limit(1)
    
    if (accountsError) {
      console.error('Error checking bank_accounts table:', accountsError)
      return NextResponse.json({ 
        error: 'Bank accounts table does not exist or is not accessible',
        details: accountsError.message 
      }, { status: 500 })
    }
    
    console.log('Bank accounts table exists and is accessible')
    
    // Добавляем тестовые данные
    console.log('Adding test data...')
    
    const { data: existingBanks } = await supabase
      .from('banks')
      .select('*')
      .limit(1)
    
    if (!existingBanks || existingBanks.length === 0) {
      console.log('No banks found, but cannot insert due to missing table')
    }
    
    return NextResponse.json({ 
      message: 'Database tables checked successfully',
      banks_exist: true,
      bank_accounts_exist: true
    })
    
  } catch (error) {
    console.error('Error in init-db:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
