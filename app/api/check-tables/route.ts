import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== CHECK TABLES API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Список таблиц для проверки
    const tables = [
      'users',
      'employees', 
      'banks',
      'bank_accounts',
      'cards',
      'casinos',
      'transactions',
      'work_entries',
      'test_sites',
      'test_entries',
      'salary_calculations',
      'activity_logs'
    ]
    
    const results: Record<string, any> = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1)
        
        if (error) {
          results[table] = {
            exists: false,
            error: error.message
          }
        } else {
          results[table] = {
            exists: true,
            count: data?.length || 0
          }
        }
      } catch (err) {
        results[table] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      tables: results
    })
  } catch (error) {
    console.error('Error checking tables:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
}
