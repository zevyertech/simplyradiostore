'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  user_id: string
  status: string
  total_amount: number
  items: string | null
  shipping_address: string | null
  payment_method: string | null
  notes: string | null
}

interface User {
  id: string
  name: string | null
  email: string
}

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface OrderFormProps {
  order?: Order
  users: User[]
}

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export function OrderForm({ order, users }: OrderFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!order

  // Parse existing items
  let initialItems: OrderItem[] = []
  try {
    if (order?.items) {
      initialItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }
  } catch {
    initialItems = []
  }
  if (initialItems.length === 0) {
    initialItems = [{ name: '', quantity: 1, price: 0 }]
  }

  const [formData, setFormData] = useState({
    order_number: order?.order_number || generateOrderNumber(),
    user_id: order?.user_id || '',
    status: order?.status || 'pending',
    shipping_address: order?.shipping_address || '',
    payment_method: order?.payment_method || 'card',
    notes: order?.notes || '',
  })
  const [items, setItems] = useState<OrderItem[]>(initialItems)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items]
    if (field === 'name') {
      newItems[index].name = value as string
    } else if (field === 'quantity') {
      newItems[index].quantity = Math.max(1, parseInt(value as string) || 1)
    } else if (field === 'price') {
      newItems[index].price = Math.max(0, parseFloat(value as string) || 0)
    }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate items
    const validItems = items.filter(item => item.name.trim() !== '')
    if (validItems.length === 0) {
      setError('Please add at least one item')
      setLoading(false)
      return
    }

    try {
      const orderData = {
        order_number: formData.order_number,
        user_id: formData.user_id || null,
        status: formData.status,
        total_amount: totalAmount,
        items: JSON.stringify(validItems),
        shipping_address: formData.shipping_address || null,
        payment_method: formData.payment_method || null,
        notes: formData.notes || null,
      }

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            ...orderData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id)

        if (updateError) {
          setError(updateError.message)
          setLoading(false)
          return
        }

        router.push(`/admin/orders/${order.id}`)
      } else {
        const { data: newOrder, error: insertError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single()

        if (insertError) {
          setError(insertError.message)
          setLoading(false)
          return
        }

        router.push(`/admin/orders/${newOrder.id}`)
      }

      router.refresh()
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="order_number" className="block text-sm font-medium text-card-foreground mb-2">
            Order Number
          </label>
          <input
            id="order_number"
            type="text"
            value={formData.order_number}
            onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-input rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            readOnly={isEditing}
          />
        </div>

        <div>
          <label htmlFor="user_id" className="block text-sm font-medium text-card-foreground mb-2">
            Customer
          </label>
          <select
            id="user_id"
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="">Select a customer</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-card-foreground mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="payment_method" className="block text-sm font-medium text-card-foreground mb-2">
            Payment Method
          </label>
          <select
            id="payment_method"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="card">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-card-foreground">
            Order Items
          </label>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Qty"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                className="w-20 px-3 py-2.5 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Price"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
                className="w-28 px-3 py-2.5 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <span className="text-sm text-muted-foreground">Total: </span>
          <span className="text-lg font-semibold text-card-foreground">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="shipping_address" className="block text-sm font-medium text-card-foreground mb-2">
          Shipping Address
        </label>
        <textarea
          id="shipping_address"
          value={formData.shipping_address}
          onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          placeholder="123 Main St, City, State 12345"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-card-foreground mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          placeholder="Internal notes about this order..."
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEditing ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Save Changes' : 'Create Order'
          )}
        </button>
      </div>
    </form>
  )
}
