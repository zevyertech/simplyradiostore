import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { OrderForm } from '@/components/admin/order-form'

export default async function NewOrderPage() {
  const supabase = await createClient()

  // Get users for dropdown
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('status', 'active')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Create New Order</h1>
          <p className="text-muted-foreground mt-1">Add a new order to the system</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <OrderForm users={users || []} />
      </div>
    </div>
  )
}
