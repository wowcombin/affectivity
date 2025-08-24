import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const draftFileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['excel', 'google_sheets']),
  url: z.string().url().optional()
})

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET DRAFT FILES API CALLED ===')
    
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

    // Получаем черновики
    let query = supabase
      .from('draft_files')
      .select(`
        *,
        user:users (
          username,
          role
        )
      `)
      .order('created_at', { ascending: false })

    // Если админ - показываем все черновики, иначе только свои
    if (currentUser.role !== 'Admin') {
      query = query.eq('user_id', currentUser.id)
    }

    const { data: drafts, error } = await query

    if (error) {
      console.error('Error fetching draft files:', error)
      return NextResponse.json({ error: 'Failed to fetch draft files' }, { status: 500 })
    }

    return NextResponse.json({ drafts: drafts || [] })
  } catch (error) {
    console.error('Error in GET /api/work-files/drafts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST DRAFT FILES API CALLED ===')
    
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

    const body = await request.json()
    const validatedData = draftFileSchema.parse(body)

    // Создаем новый черновик
    const { data: newDraft, error: insertError } = await supabase
      .from('draft_files')
      .insert({
        user_id: currentUser.id,
        name: validatedData.name,
        type: validatedData.type,
        url: validatedData.url
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating draft file:', insertError)
      return NextResponse.json({ error: 'Failed to create draft file' }, { status: 500 })
    }

    // Логируем создание черновика
    await logActivity(
      currentUser.id,
      'draft_file_created',
      {
        draft_id: newDraft.id,
        name: validatedData.name,
        type: validatedData.type
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true, 
      draft: newDraft,
      message: 'Draft file created successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/work-files/drafts:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
