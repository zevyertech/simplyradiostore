import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OrdersTable } from '@/components/admin/orders-table'
import { OrderFilters } from '@/components/admin/order-filters'

interface PageProps {
  searchParams: Promise<{
    search?: string
    page?: string
  }>
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const page = parseInt(params.page || '1')
  const limit = 10
  const offset = (page - 1) * limit

  let query = supabase
    .from('orders')
    .select('id, first_name, last_name, reading_type, created_at', { count: 'exact' })

  if (params.search) {
    query = query.or(
      `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,reading_type.ilike.%${params.search}%`,
    )
  }

  const { data: orders, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage orders</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Order
        </Link>
      </div>

      <OrderFilters />

      <OrdersTable
        orders={orders || []}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  )
}
