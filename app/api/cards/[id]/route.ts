import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

// PUT /api/cards/[id] - обновить карту
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    
    // Только CFO и Admin могут редактировать карты
    if (!['Admin', 'CFO'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для редактирования карт' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const { bank_account_id, card_number, expiry_date, cvv, card_type } = body

    // Валидация
    if (!bank_account_id || !card_number || !expiry_date || !cvv) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    if (!['pink', 'gray'].includes(card_type)) {
      return NextResponse.json(
        { error: 'Неверный тип карты' },
        { status: 400 }
      )
    }

    // Обновляем карту
    const { data, error } = await supabase
      .from('cards')
      .update({
        bank_account_id,
        card_number,
        expiry_date,
        cvv,
        card_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating card:', error)
      return NextResponse.json(
        { error: 'Ошибка обновления карты' },
        { status: 500 }
      )
    }

    return NextResponse.json({ card: data })
  } catch (error) {
    console.error('Error in PUT /api/cards/[id]:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE /api/cards/[id] - удалить карту
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    
    // Только Admin может удалять карты
    if (user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Только администратор может удалять карты' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // Проверяем, что карта существует и не используется
    const { data: card, error: checkError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', params.id)
      .single()

    if (checkError || !card) {
      return NextResponse.json(
        { error: 'Карта не найдена' },
        { status: 404 }
      )
    }

    if (card.status !== 'free') {
      return NextResponse.json(
        { error: 'Нельзя удалить карту, которая используется' },
        { status: 400 }
      )
    }

    // Удаляем карту
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting card:', error)
      return NextResponse.json(
        { error: 'Ошибка удаления карты' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/cards/[id]:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
