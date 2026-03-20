import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, User, Calendar, Package, CreditCard, MapPin, FileText } from 'lucide-react'

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-success/10 text-success'
    case 'pending':
      return 'bg-warning/10 text-warning-foreground'
    case 'processing':
      return 'bg-primary/10 text-primary'
    case 'shipped':
      return 'bg-chart-4/10 text-chart-4'
    case 'cancelled':
      return 'bg-destructive/10 text-destructive'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, users(id, name, email, phone)')
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Parse items JSON
  let orderItems: Array<{ name: string; quantity: number; price: number }> = []
  try {
    if (order.items) {
      orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }
  } catch {
    orderItems = []
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
            <h1 className="text-2xl font-semibold text-foreground">Order {order.order_number}</h1>
            <p className="text-muted-foreground mt-1">View order details and status</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order Status</p>
                <span className={`inline-block text-sm px-3 py-1.5 rounded-full capitalize mt-2 ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-semibold text-card-foreground mt-1">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-card-foreground">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Item</th>
                    <th className="text-center text-sm font-medium text-muted-foreground px-4 py-3">Qty</th>
                    <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Price</th>
                    <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orderItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No items in this order
                      </td>
                    </tr>
                  ) : (
                    orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 font-medium text-card-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 text-right font-medium text-card-foreground">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/30">
                    <td colSpan={3} className="px-4 py-3 text-right font-medium text-card-foreground">Total</td>
                    <td className="px-4 py-3 text-right font-semibold text-card-foreground">
                      {formatCurrency(order.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Order Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{order.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-card-foreground mb-4">Customer</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Link
                    href={`/admin/users/${order.users?.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {order.users?.name || 'No name'}
                  </Link>
                  <p className="text-xs text-muted-foreground">{order.users?.email}</p>
                </div>
              </div>
              {order.users?.phone && (
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-card-foreground">{order.users.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-card-foreground mb-4">Order Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm text-card-foreground">{formatDate(order.created_at)}</p>
                </div>
              </div>
              {order.payment_method && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <p className="text-sm text-card-foreground capitalize">{order.payment_method}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Shipping Address</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{order.shipping_address}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
