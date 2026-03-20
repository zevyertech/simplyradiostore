'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle } from 'lucide-react'

interface Order {
  id: string
  first_name: string
  last_name: string
  reading_type: string
}

interface OrderFormProps {
  order?: Order
}

const READING_TYPE_OPTIONS = [
  'General',
  'Love',
  'Career',
  'Finance',
  'Health',
  'Other',
]

export function OrderForm({ order }: OrderFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!order

  const [formData, setFormData] = useState({
    first_name: order?.first_name || '',
    last_name: order?.last_name || '',
    reading_type: order?.reading_type || 'General',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.reading_type.trim()) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    try {
      const orderData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        reading_type: formData.reading_type.trim(),
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
          <label htmlFor="first_name" className="block text-sm font-medium text-card-foreground mb-2">
            First Name <span className="text-destructive">*</span>
          </label>
          <input
            id="first_name"
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="First name"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-card-foreground mb-2">
            Last Name <span className="text-destructive">*</span>
          </label>
          <input
            id="last_name"
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="Last name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="reading_type" className="block text-sm font-medium text-card-foreground mb-2">
          Reading Type <span className="text-destructive">*</span>
        </label>
        <select
          id="reading_type"
          value={formData.reading_type}
          onChange={(e) => setFormData({ ...formData, reading_type: e.target.value })}
          className="w-full px-4 py-2.5 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          required
        >
          {READING_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
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
