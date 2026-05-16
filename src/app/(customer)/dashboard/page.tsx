import { createClient } from '@/lib/supabase/server'
import { MenuCard } from '@/components/customer/MenuCard'
import { OrderForm } from '@/components/customer/OrderForm'
import { ChefHat } from 'lucide-react'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('date', today)
    .eq('available', true)
    .single()

  let extras: any[] = []
  if (menu) {
    const { data: menuExtras } = await supabase
      .from('menu_extras')
      .select('*')
      .eq('menu_id', menu.id)
    extras = menuExtras || []
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
