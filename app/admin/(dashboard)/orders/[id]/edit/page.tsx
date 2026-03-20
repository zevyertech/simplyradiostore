import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { OrderForm } from '@/components/admin/order-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditOrderPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/orders/${id}`}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edit Order</h1>
          <p className="text-muted-foreground mt-1">Update order information</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <OrderForm order={order} />
      </div>
    </div>
  )
}
