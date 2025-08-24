import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE TABLES API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Проверяем, существуют ли таблицы
    console.log('Checking if tables exist...')
    
    const { data: banks, error: banksError } = await supabase
      .from('banks')
      .select('*')
      .limit(1)
    
    if (banksError) {
      console.log('Banks table does not exist:', banksError.message)
      return NextResponse.json({ 
        error: 'Banks table does not exist. Please create it manually in Supabase dashboard.',
        details: banksError.message 
      }, { status: 500 })
    }
    
    console.log('Banks table exists')
    
    const { data: accounts, error: accountsError } = await supabase
      .from('bank_accounts')
      .select('*')
      .limit(1)
    
    if (accountsError) {
      console.log('Bank accounts table does not exist:', accountsError.message)
      return NextResponse.json({ 
        error: 'Bank accounts table does not exist. Please create it manually in Supabase dashboard.',
        details: accountsError.message 
      }, { status: 500 })
    }
    
    console.log('Bank accounts table exists')
    
    // Добавляем тестовые данные, если таблицы пустые
    const { data: existingBanks } = await supabase
      .from('banks')
      .select('*')
    
    if (!existingBanks || existingBanks.length === 0) {
      console.log('Adding test banks...')
      
      const { data: testBanks, error: insertError } = await supabase
        .from('banks')
        .insert([
          { name: 'Test Bank', type: 'uk' },
          { name: 'Revolut Bank', type: 'revolut' },
          { name: 'Other Bank', type: 'other' }
        ])
        .select()
      
      if (insertError) {
        console.error('Error inserting test banks:', insertError)
      } else {
        console.log('Test banks created:', testBanks)
      }
    }
    
    return NextResponse.json({ 
      message: 'Tables exist and are accessible',
      banks: await supabase.from('banks').select('*'),
      bank_accounts: await supabase.from('bank_accounts').select('*')
    })
    
  } catch (error) {
    console.error('Error in create-tables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
