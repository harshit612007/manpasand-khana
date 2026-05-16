import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RevenueChart } from '@/components/owner/RevenueChart'
import { format } from 'date-fns'
import Link from 'next/link'
import { UtensilsCrossed, TrendingUp, AlertCircle, ArrowRight, Download } from 'lucide-react'
import dbConnect from '@/lib/db/mongodb'
import { Order } from '@/models/Order'
import { Payment } from '@/models/Payment'
import { User } from '@/models/User'
import { Menu } from '@/models/Menu'

export default async function OwnerDashboard() {
  await dbConnect()
  const supabase = await createClient()

  // Ensure authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Today's orders count and revenue
  // archived orders still count toward revenue but NOT toward visible order count
  const todayAllOrders = await Order.find({ createdAt: { $gte: today } }).lean()
  const todayOrders = todayAllOrders.filter(o => !o.archived)

  const todaysRevenue = todayAllOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const todaysOrdersCount = todayOrders.length
  const pendingOrdersCount = todayOrders.filter(o => o.status === 'pending').length

  // 2. Total Dues
  const allOrders = await Order.find({ status: 'delivered' }).lean()
  const allPayments = await Payment.find().lean()
  
  const totalDelivered = allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalDues = Math.max(0, totalDelivered - totalPaid)

  // 3. Recent 5 orders
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean()
  
  // Fetch related users and menus for recent orders
  const userIds = [...new Set(recentOrders.map(o => o.user_id))]
  const users = await User.find({ supabaseId: { $in: userIds } }).lean()
  const userMap = users.reduce((acc: any, u) => { acc[u.supabaseId] = u; return acc }, {})
  
  const menuIds = [...new Set(recentOrders.map(o => o.menu_id))]
  const menus = await Menu.find({ _id: { $in: menuIds } }).lean()
  const menuMap = menus.reduce((acc: any, m) => { acc[m._id?.toString()] = m; return acc }, {})

  const recentOrdersWithDetails = recentOrders.map(o => ({
    ...o,
    id: o._id?.toString(),
    customerName: userMap[o.user_id]?.name || 'Unknown',
    itemName: menuMap[o.menu_id]?.item_name || 'Unknown Item'
  }))

  // 4. Mock Revenue Data for Chart
  const revenueData = [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 18000 },
    { month: 'Mar', revenue: 22000 },
    { month: 'Apr', revenue: 21000 },
    { month: 'May', revenue: 26000 },
    { month: 'Jun', revenue: todaysRevenue > 0 ? 26000 + todaysRevenue : 28000 },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">Owner Dashboard</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM do yyyy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{todaysRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">From delivered orders today</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todaysOrdersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{pendingOrdersCount} pending right now</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 shadow-sm bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Total Outstanding Dues</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{totalDues}</div>
            <Link href="/admin/payments" className="text-xs text-destructive hover:underline mt-1 flex items-center gap-1">
              View customers <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Export Data Section */}
      <Card className="border-primary/20 shadow-sm bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Export Data (CSV)</CardTitle>
          <CardDescription>Download your data for accounting and backup purposes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <a href="/api/export?type=orders&range=all" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
              <Download className="w-4 h-4" /> All Orders
            </a>
            <a href="/api/export?type=orders&range=month" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
              <Download className="w-4 h-4" /> This Month's Orders
            </a>
            <a href="/api/export?type=payments&range=all" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
              <Download className="w-4 h-4" /> All Payments
            </a>
            <a href="/api/export?type=dues" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
              <Download className="w-4 h-4" /> Pending Dues Report
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Overview (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card className="col-span-1 border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrdersWithDetails && recentOrdersWithDetails.length > 0 ? (
                recentOrdersWithDetails.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.itemName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">₹{order.total_amount}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
