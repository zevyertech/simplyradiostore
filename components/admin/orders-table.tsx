'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DeleteConfirmModal } from './delete-confirm-modal'

interface Order {
  id: string
  first_name: string
  last_name: string
  reading_type: string
  created_at: string
}

interface OrdersTableProps {
  orders: Order[]
  currentPage: number
  totalPages: number
  totalCount: number
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function OrdersTable({ orders, currentPage, totalPages, totalCount }: OrdersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; order: Order | null }>({
    open: false,
    order: null,
  })
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/admin/orders?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteModal.order) return
    
    setDeleting(true)
    await supabase.from('orders').delete().eq('id', deleteModal.order.id)
    setDeleting(false)
    setDeleteModal({ open: false, order: null })
    router.refresh()
  }

  return (
    <>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">First Name</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Last Name</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Reading Type</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Date</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-card-foreground font-medium">{order.first_name}</td>
                    <td className="px-4 py-3 text-sm text-card-foreground font-medium">{order.last_name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{order.reading_type}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/orders/${order.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ open: true, order })}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, order: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Order"
        description={`Are you sure you want to delete ${deleteModal.order?.first_name} ${deleteModal.order?.last_name}? This action cannot be undone.`}
      />
    </>
  )
}
