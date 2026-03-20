import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/users-table'
import { UserFilters } from '@/components/admin/user-filters'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    page?: string
  }>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  
  const page = parseInt(params.page || '1')
  const limit = 10
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
  
  // Apply search filter
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
  }
  
  // Apply status filter
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  
  const { data: users, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all registered users
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Link>
      </div>

      <UserFilters />
      
      <UsersTable 
        users={users || []} 
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  )
}
