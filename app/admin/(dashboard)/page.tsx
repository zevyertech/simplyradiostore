import { createClient } from '@/lib/supabase/server'
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()
  
  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  // Get active users
  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  
  // Get total orders
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
  
  // Get pending orders
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  
  // Get total revenue
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'completed')
  
  const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
  
  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, users(name, email)')
    .order('created_at', { ascending: false })
    .limit(5)
  
  // Get recent users
  const { data: recentUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    totalRevenue,
    recentOrders: recentOrders || [],
    recentUsers: recentUsers || [],
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
    case 'completed':
      return 'bg-success/10 text-success'
    case 'pending':
    case 'processing':
      return 'bg-warning/10 text-warning-foreground'
    case 'inactive':
    case 'cancelled':
      return 'bg-destructive/10 text-destructive'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      subValue: `${stats.activeUsers} active`,
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      subValue: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      color: 'bg-accent/10 text-accent',
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      subValue: 'From completed orders',
      icon: DollarSign,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Conversion',
      value: stats.totalUsers > 0 
        ? `${Math.round((stats.totalOrders / stats.totalUsers) * 100)}%` 
        : '0%',
      subValue: 'Orders per user',
      icon: TrendingUp,
      color: 'bg-chart-3/10 text-chart-3',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-lg border border-border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold text-card-foreground mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-card-foreground">Recent Orders</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No orders yet
              </div>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">
                      {order.order_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.users?.name || order.users?.email || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-card-foreground">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-card-foreground">Recent Users</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.recentUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No users yet
              </div>
            ) : (
              stats.recentUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{user.name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
