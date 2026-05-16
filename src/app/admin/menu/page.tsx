import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { addMenuExtra, deleteMenuExtra } from '@/lib/actions/menu'
import { Trash2, Plus, ChefHat, Utensils } from 'lucide-react'
import dbConnect from '@/lib/db/mongodb'
import { Menu } from '@/models/Menu'
import { MenuExtra } from '@/models/MenuExtra'
import FullMealForm from './FullMealForm'

export default async function OwnerMenu() {
  await dbConnect()
  const supabase = await createClient()

  // Ensure authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const menuDoc = await Menu.findOne({ date: today }).lean()
  const menu = menuDoc ? { ...menuDoc, id: menuDoc._id?.toString() } : null

  let extras: any[] = []
  if (menu) {
    const extrasDocs = await MenuExtra.find({ menuId: menu.id }).sort({ createdAt: 1 }).lean()
    extras = extrasDocs.map(e => ({ ...e, id: e._id?.toString() }))
  }

  const fullMealPrice = Number(menu?.price ?? 0)
  const individualTotal = extras.reduce((sum: number, e: any) => sum + Number(e.price), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Menu Management</h1>
        <p className="text-muted-foreground">Set today's full meal and individual item prices. Customers can order the full thali or pick individual items.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Full Meal Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="p-2 rounded-full bg-primary/10">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Today's Full Meal (Thali)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">The complete meal price customers can order</p>
            </div>
          </CardHeader>
          <CardContent>
            <FullMealForm menu={menu} today={today} extrasTotal={individualTotal} />
          </CardContent>
        </Card>

        {/* Individual Items Card */}
        <Card className="border-border shadow-sm h-fit">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Individual Items & Extras</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Customers can mix & match these separately</p>
            </div>
          </CardHeader>
          <CardContent>
            {!menu ? (
              <div className="text-center py-8">
                <ChefHat className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">Save the full meal first, then add individual items.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Add item form */}
                <form action={async (formData) => {
                  'use server'
                  const name = formData.get('name') as string
                  const price = parseFloat(formData.get('price') as string)
                  await addMenuExtra(menu.id, name, price)
                }} className="space-y-3 border-b border-border pb-6">
                  <p className="text-sm font-semibold text-foreground">Add an Item</p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="extra_name" className="text-xs">Item Name</Label>
                      <Input id="extra_name" name="name" required placeholder="e.g. Dal, 2 Rotis, Rice, Sabzi" />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label htmlFor="extra_price" className="text-xs">Price ₹</Label>
                      <Input id="extra_price" name="price" type="number" min="0" step="0.5" required placeholder="30" />
                    </div>
                    <Button type="submit" size="icon" className="shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </form>

                {/* Items list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Current Items ({extras.length})</h4>
                    {extras.length > 0 && (
                      <span className="text-xs text-muted-foreground">Total: ₹{individualTotal}</span>
                    )}
                  </div>
                  {extras.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No individual items yet. Add items like Dal, Roti, Rice, Sabzi etc.</p>
                  ) : (
                    <div className="space-y-2">
                      {extras.map((extra: any) => (
                        <div key={extra.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                          <div>
                            <p className="font-bold text-sm text-foreground">{extra.name}</p>
                            <p className="text-xs text-primary font-semibold">₹{extra.price}</p>
                          </div>
                          <form action={async () => {
                            'use server'
                            await deleteMenuExtra(extra.id)
                          }}>
                            <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary */}
                {extras.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm space-y-1">
                    <p className="font-semibold text-foreground">Pricing Summary</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Full Meal Price</span>
                      <span className="font-bold text-foreground">₹{fullMealPrice}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Individual Items Total</span>
                      <span>₹{individualTotal}</span>
                    </div>
                    {individualTotal > fullMealPrice && (
                      <div className="flex justify-between text-green-700 dark:text-green-400 pt-1 border-t border-primary/20">
                        <span className="font-semibold">Customer saves</span>
                        <span className="font-bold">₹{individualTotal - fullMealPrice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
