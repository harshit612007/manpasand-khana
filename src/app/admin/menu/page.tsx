import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, ChefHat, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import dbConnect from '@/lib/db/mongodb'
import { Menu } from '@/models/Menu'
import { addMenuItem, deleteMenuItem, setBundlePrice, toggleMenuAvailability } from '@/lib/actions/menu'

export default async function OwnerMenu() {
  await dbConnect()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const menuDoc = await Menu.findOne({ date: today }).lean()
  const menu = menuDoc ? { ...menuDoc, id: menuDoc._id?.toString() } : null

  const totalRevenue = (menu?.items || []).reduce((sum: number, item: any) => sum + item.price, 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">Menu Management</h1>
          <p className="text-muted-foreground">Add items for today. Customers will pick what they want.</p>
        </div>
        {menu && (
          <form action={async () => {
            'use server'
            await toggleMenuAvailability(menu.id, !menu.available)
          }}>
            <Button type="submit" variant={menu.available ? 'default' : 'outline'} className="gap-2">
              {menu.available 
                ? <><ToggleRight className="w-4 h-4" /> Menu is Open</>
                : <><ToggleLeft className="w-4 h-4" /> Menu is Closed</>
              }
            </Button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Item Form */}
        <Card className="border-border shadow-sm h-fit">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Add Item</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Today: {today}</p>
            </div>
          </CardHeader>
          <CardContent>
            <form action={addMenuItem} className="space-y-4">
              <input type="hidden" name="date" value={today} />
              <div className="space-y-1">
                <Label htmlFor="name">Item Name *</Label>
                <Input id="name" name="name" required placeholder="e.g. Dal Tadka, Paneer Butter Masala" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input id="price" name="price" type="number" min="0" step="0.5" required placeholder="40" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description (optional)</Label>
                <Input id="description" name="description" placeholder="e.g. With ghee, served with..." />
              </div>
              <Button type="submit" className="w-full gap-2">
                <Plus className="w-4 h-4" /> Add to Today's Menu
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's Items */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="p-2 rounded-full bg-primary/10">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>Today's Items ({menu?.items?.length || 0})</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Customers see and order from this list</p>
            </div>
            {menu && (menu?.items?.length || 0) > 0 && (
              <span className="text-sm font-bold text-primary">Total: ₹{totalRevenue}</span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!menu || (menu?.items?.length || 0) === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground font-medium">No items added yet</p>
                <p className="text-xs text-muted-foreground mt-1">Use the form to add today's dishes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {menu.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground truncate">{item.name}</p>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
                      )}
                    </div>
                    <span className="font-extrabold text-primary text-lg shrink-0">₹{item.price}</span>
                    <form action={async () => {
                      'use server'
                      await deleteMenuItem(menu.id, item.id)
                    }}>
                      <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            {/* Bundle Price Section */}
            {menu && (menu?.items?.length || 0) > 0 && (
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm">Full Thali Bundle Price (Optional)</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set a discounted flat price so customers can one-click order everything. 
                  {menu.bundle_price ? ` Currently: ₹${menu.bundle_price}` : ' Not set — customers pick items individually.'}
                </p>
                <form action={async (formData) => {
                  'use server'
                  const val = formData.get('bundle_price') as string
                  const price = val ? parseFloat(val) : null
                  await setBundlePrice(menu.id, price)
                }} className="flex gap-2">
                  <Input
                    name="bundle_price"
                    type="number"
                    min="0"
                    step="0.5"
                    defaultValue={menu.bundle_price || ''}
                    placeholder={`e.g. ${Math.round(totalRevenue * 0.85)} (15% off)`}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline" className="shrink-0">
                    {menu.bundle_price ? 'Update' : 'Set'} Bundle
                  </Button>
                  {menu.bundle_price && (
                    <form action={async () => {
                      'use server'
                      await setBundlePrice(menu.id, null)
                    }}>
                      <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive shrink-0">
                        Remove
                      </Button>
                    </form>
                  )}
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
