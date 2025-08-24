import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST CONNECTION API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Проверяем подключение к базе данных
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('Database connection error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data: data
    })
  } catch (error) {
    console.error('Error in test connection:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
}
