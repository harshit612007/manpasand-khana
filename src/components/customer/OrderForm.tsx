'use client'

import { useState, useTransition } from 'react'
import { createOrder } from '@/lib/actions/orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Minus, Plus, Loader2 } from 'lucide-react'

type Menu = {
  id: string
  item_name: string
  price: number
  description: string
  image_url?: string
  items?: { id: string; name: string; price?: number }[]
}

type Extra = {
  id: string
  name: string
  price: number
}

export function OrderForm({ menu, extras }: { menu: Menu, extras: Extra[] }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set())
  const [excludedItems, setExcludedItems] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const increment = () => setQuantity(q => q + 1)
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1))

  const toggleExtra = (id: string) => {
    const newExtras = new Set(selectedExtras)
    if (newExtras.has(id)) newExtras.delete(id)
    else newExtras.add(id)
    setSelectedExtras(newExtras)
  }

  const toggleIncludedItem = (id: string) => {
    const newExcluded = new Set(excludedItems)
    if (newExcluded.has(id)) newExcluded.delete(id)
    else newExcluded.add(id)
    setExcludedItems(newExcluded)
  }

  const extrasTotal = Array.from(selectedExtras).reduce((sum, id) => {
    const extra = extras.find(e => e.id === id)
    return sum + (extra?.price || 0)
  }, 0)

  const excludedItemsTotal = Array.from(excludedItems).reduce((sum, id) => {
    const item = menu.items?.find(i => i.id === id)
    return sum + (item?.price || 0)
  }, 0)

  const totalAmount = (Math.max(0, menu.price - excludedItemsTotal) * quantity) + extrasTotal

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('quantity', quantity.toString())
    
    const selectedExtrasData = Array.from(selectedExtras).map(id => {
      const extra = extras.find(e => e.id === id)!
      return { id: extra.id, name: extra.name, price: extra.price }
    })

    const excludedItemsData = Array.from(excludedItems).map(id => {
      const item = menu.items?.find(i => i.id === id)!
      return { id: item.id, name: item.name, price: item.price || 0 }
    })

    startTransition(async () => {
      try {
        await createOrder(formData, selectedExtrasData, excludedItemsData)
        toast.success("Order placed successfully!")
        setQuantity(1)
        setSelectedExtras(new Set())
        setExcludedItems(new Set())
      } catch (error: any) {
        toast.error(error.message || "Failed to place order")
      }
    })
  }

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl">Place Your Order</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <input type="hidden" name="menu_id" value={menu.id} />
          
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Quantity</Label>
            <div className="flex items-center gap-4 bg-muted rounded-full p-1">
              <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={decrement}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-bold text-lg w-4 text-center">{quantity}</span>
              <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={increment}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {menu.items && menu.items.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <Label className="text-base font-semibold">Included in Full Meal</Label>
              <div className="flex flex-wrap gap-2">
                {menu.items.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer transition-colors select-none ${!excludedItems.has(item.id) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted border-border text-muted-foreground line-through opacity-70'}`} 
                    onClick={() => toggleIncludedItem(item.id)}
                  >
                    <span className="text-sm font-medium">{item.name} {item.price ? `(-₹${item.price})` : ''}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Tap to remove items you don't want (price will be deducted).</p>
            </div>
          )}

          {extras.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <Label className="text-base font-semibold">Add-ons</Label>
              <div className="grid gap-2">
                {extras.map(extra => (
                  <div key={extra.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id={`extra-${extra.id}`} 
                        checked={selectedExtras.has(extra.id)}
                        onCheckedChange={() => toggleExtra(extra.id)}
                      />
                      <Label htmlFor={`extra-${extra.id}`} className="cursor-pointer">{extra.name}</Label>
                    </div>
                    <span className="font-medium text-primary">₹{extra.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t border-border">
            <Label htmlFor="notes">Special Instructions (Optional)</Label>
            <Input id="notes" name="notes" placeholder="e.g. Less spicy, no onions..." />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="text-lg font-bold text-muted-foreground">Total</span>
            <span className="text-2xl font-extrabold text-primary">₹{totalAmount}</span>
          </div>

        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full h-12 text-lg rounded-full" disabled={isPending}>
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
