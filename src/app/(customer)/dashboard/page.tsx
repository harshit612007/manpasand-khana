import { createClient } from '@/lib/supabase/server'
import { OrderForm } from '@/components/customer/OrderForm'
import { ChefHat, Utensils } from 'lucide-react'
import dbConnect from '@/lib/db/mongodb'
import { Menu } from '@/models/Menu'

export default async function CustomerDashboard() {
  await dbConnect()
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Fetch menu regardless of availability so we can show right message
  const menuDoc = await Menu.findOne({ date: today }).lean()
  const isClosed = menuDoc && !menuDoc.available
  const menu = menuDoc && menuDoc.available ? {
    id: menuDoc._id?.toString(),
    available: menuDoc.available,
    bundle_price: menuDoc.bundle_price,
    items: (menuDoc.items || []).map((i: any) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      description: i.description,
      available: i.available ?? true,
    }))
  } : null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Today's Menu</h1>
        <p className="text-muted-foreground">Select the items you want and place your order.</p>
      </div>

      {menu && menu.items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Menu Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Today's Items</h2>
                  <p className="text-xs text-muted-foreground">{today}</p>
                </div>
              </div>
              <div className="space-y-2">
                {menu.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <span className="font-bold text-primary shrink-0 ml-4">₹{item.price}</span>
                  </div>
                ))}
              </div>
              {menu.bundle_price && (
                <div className="mt-3 pt-3 border-t border-primary/20 flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Full Thali Bundle</span>
                  <span className="font-extrabold text-primary">₹{menu.bundle_price}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Form */}
          <div className="lg:col-span-3">
            <OrderForm menu={menu} />
          </div>
        </div>
      ) : isClosed ? (
        <div className="flex flex-col items-center justify-center p-12 bg-destructive/5 border border-destructive/20 rounded-2xl text-center">
          <div className="p-4 bg-destructive/10 rounded-full mb-4">
            <ChefHat className="w-12 h-12 text-destructive opacity-70" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Orders are Closed</h2>
          <p className="text-muted-foreground max-w-md">
            The kitchen has stopped accepting orders for today. Please contact the owner or check back tomorrow.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-dashed border-border rounded-2xl text-center">
          <ChefHat className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Menu is being prepared!</h2>
          <p className="text-muted-foreground max-w-md">
            The owner hasn't posted today's menu yet. Please check back in a little while.
          </p>
        </div>
      )}
    </div>
  )
}
