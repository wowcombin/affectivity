import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== CHECK EMPLOYEES TABLE API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Проверяем существование таблицы
    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('Table does not exist or error:', error)
      return NextResponse.json({ 
        exists: false, 
        error: error.message 
      })
    }
    
    return NextResponse.json({ 
      exists: true, 
      message: 'Employees table exists' 
    })
  } catch (error) {
    console.error('Error in GET /api/check-employees-table:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
