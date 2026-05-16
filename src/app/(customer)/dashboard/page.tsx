import { createClient } from '@/lib/supabase/server'
import { MenuCard } from '@/components/customer/MenuCard'
import { OrderForm } from '@/components/customer/OrderForm'
import { ChefHat } from 'lucide-react'
import dbConnect from '@/lib/db/mongodb'
import { Menu } from '@/models/Menu'
import { MenuExtra } from '@/models/MenuExtra'

export default async function CustomerDashboard() {
  await dbConnect()
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const menuDoc = await Menu.findOne({ date: today, available: true }).lean()
  const menu = menuDoc ? { ...menuDoc, id: menuDoc._id?.toString() } : null

  let extras: any[] = []
  if (menu) {
    const extrasDocs = await MenuExtra.find({ menuId: menu.id }).lean()
    extras = extrasDocs.map(e => ({ ...e, id: e._id?.toString() }))
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Today's Menu</h1>
        <p className="text-muted-foreground">Freshly prepared for you.</p>
      </div>

      {menu ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <MenuCard menu={menu} />
          </div>
          <div>
            <OrderForm menu={menu} extras={extras} />
          </div>
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
