import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { updateOrderStatus } from '@/lib/actions/orders'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { Order } from '@/models/Order'
import { Menu } from '@/models/Menu'

export default async function OwnerOrders({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await dbConnect()
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams
  const filter = resolvedSearchParams?.filter || 'all'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let filterQuery: any = { createdAt: { $gte: today } }
  if (filter !== 'all') {
    filterQuery.status = filter
  }

  const rawOrders = await Order.find(filterQuery).sort({ createdAt: -1 }).lean()
  
  // Fetch related users and menus
  const userIds = [...new Set(rawOrders.map(o => o.user_id))]
  const users = await User.find({ supabaseId: { $in: userIds } }).lean()
  const userMap = users.reduce((acc: any, u) => { acc[u.supabaseId] = u; return acc }, {})
  
  const menuIds = [...new Set(rawOrders.map(o => o.menu_id))]
  const menus = await Menu.find({ _id: { $in: menuIds } }).lean()
  const menuMap = menus.reduce((acc: any, m) => { acc[m._id?.toString()] = m; return acc }, {})

  const orders = rawOrders.map(o => ({
    ...o,
    id: o._id?.toString(),
    profiles: userMap[o.user_id] || {},
    menus: menuMap[o.menu_id] || {},
    created_at: o.createdAt
  }))

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
      case 'preparing': return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'delivered': return 'bg-green-500/10 text-green-700 border-green-500/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">Today's Orders</h1>
          <p className="text-muted-foreground">Manage and update order statuses.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex gap-2">
            {['all', 'pending', 'preparing', 'delivered'].map(f => (
              <a 
                key={f}
                href={`/orders?filter=${f}`} 
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize transition-colors ${
                  filter === f 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f}
              </a>
            ))}
          </div>
          <a href="/api/export" download>
            <Button variant="outline" className="w-full sm:w-auto shadow-sm gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </a>
        </div>
      </div>

      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id} className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-foreground">{order.profiles?.name}</h3>
                      <Badge variant="outline" className={`capitalize shadow-none border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                      <p><strong>Phone:</strong> {order.profiles?.phone || 'Not provided'}</p>
                      <p><strong>Address:</strong> {order.profiles?.address || 'Not provided'}</p>
                      <p><strong>Item:</strong> {order.menus?.item_name}</p>
                      <p><strong>Time:</strong> {new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'short' }).format(new Date(order.created_at))}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-muted px-2 py-1 rounded-md text-xs font-bold">Qty: {order.quantity}</span>
                      {order.extras && Array.isArray(order.extras) && order.extras.length > 0 && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold">
                          Extras: {order.extras.map((e: any) => e.name).join(', ')}
                        </span>
                      )}
                    </div>

                    {order.notes && (
                      <p className="text-sm text-foreground mt-2 italic bg-yellow-500/10 p-2 rounded-md border-l-2 border-yellow-500">
                        <strong>Note:</strong> {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col justify-between items-end gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <span className="text-3xl font-extrabold text-primary">₹{order.total_amount}</span>
                    
                    <div className="flex gap-2">
                      <form action={async () => { 'use server'; await updateOrderStatus(order.id, 'pending') }}>
                        <Button type="submit" size="sm" variant={order.status === 'pending' ? 'default' : 'outline'} disabled={order.status === 'pending'}>
                          Pending
                        </Button>
                      </form>
                      <form action={async () => { 'use server'; await updateOrderStatus(order.id, 'preparing') }}>
                        <Button type="submit" size="sm" variant={order.status === 'preparing' ? 'default' : 'outline'} disabled={order.status === 'preparing'}>
                          Preparing
                        </Button>
                      </form>
                      <form action={async () => { 'use server'; await updateOrderStatus(order.id, 'delivered') }}>
                        <Button type="submit" size="sm" variant={order.status === 'delivered' ? 'default' : 'outline'} disabled={order.status === 'delivered'}>
                          Delivered
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-12 bg-card border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No orders found for today with this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
