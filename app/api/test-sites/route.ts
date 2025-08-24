import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const testSiteSchema = z.object({
  casino_name: z.string().min(1, 'Casino name is required'),
  promo_link: z.string().url('Valid URL is required'),
  card_bins: z.array(z.string()).min(1, 'At least one card BIN is required'),
  currency: z.string().default('USD'),
  withdrawal_time: z.number().min(0, 'Withdrawal time must be non-negative'),
  withdrawal_time_unit: z.enum(['instant', 'minutes', 'hours']).default('instant'),
  manual: z.string().optional(),
  status: z.enum(['active', 'processing', 'testing']).default('testing')
})

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET TEST SITES API CALLED ===')
    
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

    const supabase = createAdminClient()
    
    // Получаем данные пользователя
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем права доступа
    if (!['Tester', 'Manager', 'Admin'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Получаем тестовые сайты
    const { data: sites, error } = await supabase
      .from('test_sites')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching test sites:', error)
      return NextResponse.json({ error: 'Failed to fetch test sites' }, { status: 500 })
    }

    return NextResponse.json({ sites: sites || [] })
  } catch (error) {
    console.error('Error in GET /api/test-sites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST TEST SITES API CALLED ===')
    
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

    const supabase = createAdminClient()
    const clientIP = getClientIP(request)
    
    // Получаем данные пользователя
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем права доступа
    if (!['Tester', 'Manager', 'Admin'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = testSiteSchema.parse(body)

    // Создаем новый тестовый сайт
    const { data: newSite, error: insertError } = await supabase
      .from('test_sites')
      .insert({
        casino_name: validatedData.casino_name,
        promo_link: validatedData.promo_link,
        card_bins: validatedData.card_bins,
        currency: validatedData.currency,
        withdrawal_time: validatedData.withdrawal_time,
        withdrawal_time_unit: validatedData.withdrawal_time_unit,
        manual: validatedData.manual,
        status: validatedData.status
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating test site:', insertError)
      return NextResponse.json({ error: 'Failed to create test site' }, { status: 500 })
    }

    // Логируем создание тестового сайта
    await logActivity(
      currentUser.id,
      'test_site_created',
      {
        site_id: newSite.id,
        casino_name: validatedData.casino_name,
        status: validatedData.status
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true, 
      site: newSite,
      message: 'Test site created successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/test-sites:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
