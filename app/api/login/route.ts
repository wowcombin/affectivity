import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash)
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Check if IP is blocked
    const { data: blockedIP } = await supabaseAdmin
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', clientIP)
      .eq('is_active', true)
      .single()

    if (blockedIP) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Create session
    const sessionData = {
      user_id: user.id,
      ip_address: clientIP,
      user_agent: request.headers.get('user-agent') || 'unknown',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    const { data: session } = await supabaseAdmin
      .from('user_sessions')
      .insert(sessionData)
      .select()
      .single()

    // Log activity
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'login',
        details: { ip: clientIP },
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent')
      })

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        sessionId: session?.id
      },
      process.env.SUPABASE_JWT_SECRET!,
      { expiresIn: '24h' }
    )

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
