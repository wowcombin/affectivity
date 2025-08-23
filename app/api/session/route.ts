import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as any

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, username, role, full_name, email')
      .eq('id', decoded.userId)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    )
  }
}
