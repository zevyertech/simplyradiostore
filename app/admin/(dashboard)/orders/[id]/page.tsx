import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, User } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function OrderDetailPage({ params }: PageProps) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Order Details</h1>
            <p className="text-muted-foreground mt-1">View order information</p>
          </div>
        </div>
        <Link
          href={`/admin/orders/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          <Edit className="w-4 h-4" />
          Edit Order
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">First Name</p>
              <p className="text-base font-medium text-card-foreground">{order.first_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Last Name</p>
              <p className="text-base font-medium text-card-foreground">{order.last_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Reading Type</p>
              <p className="text-base font-medium text-card-foreground">{order.reading_type}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm text-card-foreground">{formatDate(order.created_at)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Updated</p>
              <p className="text-sm text-card-foreground">{formatDate(order.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
