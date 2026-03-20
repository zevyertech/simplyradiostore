import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExportButton } from '@/components/admin/export-button'
import { Database, Download, Users, ShoppingCart, Shield } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/admin/login')
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser) {
    redirect('/admin/login')
  }

  // Get counts
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your admin account and export data</p>
      </div>

      {/* Admin Profile */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-card-foreground">Admin Profile</h2>
            <p className="text-sm text-muted-foreground mt-1">Your admin account information</p>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-24">Email:</span>
                <span className="text-sm text-card-foreground">{adminUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-24">Role:</span>
                <span className="text-sm text-card-foreground capitalize">{adminUser.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-24">Status:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${adminUser.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {adminUser.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {adminUser.last_login && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-24">Last Login:</span>
                  <span className="text-sm text-card-foreground">
                    {new Date(adminUser.last_login).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
            <Download className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-card-foreground">Data Export</h2>
            <p className="text-sm text-muted-foreground mt-1">Export your data as CSV files</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-card-foreground">Users</p>
                    <p className="text-xs text-muted-foreground">{userCount || 0} records</p>
                  </div>
                </div>
                <ExportButton type="users" label="Export Users" />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-card-foreground">Orders</p>
                    <p className="text-xs text-muted-foreground">{orderCount || 0} records</p>
                  </div>
                </div>
                <ExportButton type="orders" label="Export Orders" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Info */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-chart-4/10 rounded-full flex items-center justify-center">
            <Database className="w-6 h-6 text-chart-4" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-card-foreground">Database Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">Summary of your database records</p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-semibold text-card-foreground">{userCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Users</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-semibold text-card-foreground">{orderCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
