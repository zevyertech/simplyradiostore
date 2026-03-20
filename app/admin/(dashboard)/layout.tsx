import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }
  
  // Verify admin access
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, email, role, is_active')
    .eq('auth_user_id', user.id)
    .single()
  
  if (!adminUser || !adminUser.is_active) {
    redirect('/admin/login')
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader adminUser={adminUser} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
