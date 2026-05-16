import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

export default async function CustomerOrders() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: orders } = await supabase
    .from('orders')
    .select('*, menus(item_name, image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20'
      case 'preparing': return 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20'
      case 'delivered': return 'bg-green-500/10 text-green-700 hover:bg-green-500/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Your Orders</h1>
        <p className="text-muted-foreground">Track and review your past tiffins.</p>
      </div>

      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id} className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-foreground">{order.menus?.item_name || 'Deleted Item'}</h3>
                      <Badge className={`capitalize shadow-none ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground font-medium">
                      {format(new Date(order.created_at), 'PPP at p')}
                    </p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded-md">Qty: {order.quantity}</span>
                      {order.extras && Array.isArray(order.extras) && order.extras.length > 0 && (
                        <span className="bg-muted px-2 py-1 rounded-md">
                          Extras: {order.extras.map((e: any) => e.name).join(', ')}
                        </span>
                      )}
                    </div>
                    
                    {order.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic bg-muted/50 p-2 rounded-md border-l-2 border-primary">
                        Note: {order.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="sm:text-right mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                    <span className="text-sm text-muted-foreground font-medium">Total Amount</span>
                    <span className="text-2xl font-extrabold text-primary">₹{order.total_amount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-12 bg-card border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
