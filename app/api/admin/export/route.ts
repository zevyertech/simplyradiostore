import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = request.nextUrl.searchParams.get('type')
  
  if (type === 'users') {
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (!users) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    const csv = convertToCSV(users, [
      'id', 'name', 'email', 'phone', 'status', 'address', 'created_at', 'updated_at'
    ])

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  if (type === 'orders') {
    const { data: orders } = await supabase
      .from('orders')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })

    if (!orders) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    const flattenedOrders = orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.users?.name || '',
      customer_email: order.users?.email || '',
      status: order.status,
      total_amount: order.total_amount,
      payment_method: order.payment_method || '',
      shipping_address: order.shipping_address?.replace(/\n/g, ' ') || '',
      created_at: order.created_at,
    }))

    const csv = convertToCSV(flattenedOrders, [
      'id', 'order_number', 'customer_name', 'customer_email', 'status', 
      'total_amount', 'payment_method', 'shipping_address', 'created_at'
    ])

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
}

function convertToCSV(data: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',')
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col]
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      // Escape quotes and wrap in quotes if contains comma or newline
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  )
  return [header, ...rows].join('\n')
}
