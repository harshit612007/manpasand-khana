'use client'

import { useState, useTransition } from 'react'
import { createOrder } from '@/lib/actions/orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Minus, Plus, Loader2, ShoppingBasket, Utensils } from 'lucide-react'

type MenuItem = {
  id: string
  name: string
  price: number
  description?: string
  available: boolean
}

type Menu = {
  id: string
  available: boolean
  bundle_price?: number
  items: MenuItem[]
}

export function OrderForm({ menu }: { menu: Menu }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isBundle, setIsBundle] = useState(false)
  const [isPending, startTransition] = useTransition()

  const increment = () => setQuantity(q => q + 1)
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1))

  const toggleItem = (id: string) => {
    if (isBundle) return // can't toggle individual items in bundle mode
    const next = new Set(selectedItems)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedItems(next)
  }

  const activateBundle = () => {
    setIsBundle(true)
    setSelectedItems(new Set(menu.items.filter(i => i.available).map(i => i.id)))
  }

  const deactivateBundle = () => {
    setIsBundle(false)
    setSelectedItems(new Set())
  }

  const selectedList = menu.items.filter(i => selectedItems.has(i.id))
  const itemsTotal = selectedList.reduce((sum, i) => sum + i.price, 0)
  const totalAmount = isBundle && menu.bundle_price
    ? menu.bundle_price * quantity
    : itemsTotal * quantity

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item")
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('quantity', quantity.toString())
    formData.set('is_bundle', isBundle ? 'true' : 'false')

    const selectedItemsData = selectedList.map(i => ({
      id: i.id, name: i.name, price: isBundle && menu.bundle_price
        ? Math.round((i.price / itemsTotal) * (menu.bundle_price)) // proportional price in bundle
        : i.price
    }))

    startTransition(async () => {
      try {
        await createOrder(formData, selectedItemsData, totalAmount)
        toast.success("Order placed successfully! 🎉")
        setQuantity(1)
        setSelectedItems(new Set())
        setIsBundle(false)
      } catch (error: any) {
        toast.error(error.message || "Failed to place order")
      }
    })
  }

  const availableItems = menu.items.filter(i => i.available)

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ShoppingBasket className="w-5 h-5 text-primary" />
          Place Your Order
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <input type="hidden" name="menu_id" value={menu.id} />

          {/* Bundle CTA */}
          {menu.bundle_price && (
            <div className={`p-4 rounded-xl border-2 transition-all ${isBundle ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-primary" />
                    Full Thali Bundle
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">All items at a flat rate</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-extrabold text-primary">₹{menu.bundle_price}</span>
                  {isBundle ? (
                    <Button type="button" size="sm" variant="outline" onClick={deactivateBundle}>
                      Cancel
                    </Button>
                  ) : (
                    <Button type="button" size="sm" onClick={activateBundle}>
                      Select
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Item Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {menu.bundle_price ? 'Or Choose Items' : 'Select Items'}
              </Label>
              {selectedItems.size > 0 && !isBundle && (
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                  {selectedItems.size} selected
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {availableItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer select-none ${
                    selectedItems.has(item.id)
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:bg-muted/50'
                  } ${isBundle ? 'opacity-70 cursor-default' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                      disabled={isBundle}
                      className="pointer-events-none"
                    />
                    <div>
                      <Label className="font-semibold cursor-pointer">{item.name}</Label>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-primary shrink-0 ml-2">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (Optional)</Label>
            <Input id="notes" name="notes" placeholder="e.g. Less spicy, no onions..." />
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div>
              <span className="text-lg font-bold text-muted-foreground">Total</span>
              {selectedItems.size > 0 && quantity > 1 && (
                <p className="text-xs text-muted-foreground">
                  {isBundle ? `₹${menu.bundle_price}` : `₹${itemsTotal}`} × {quantity}
                </p>
              )}
            </div>
            <span className="text-2xl font-extrabold text-primary">₹{totalAmount}</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full h-12 text-lg rounded-full"
            disabled={isPending || selectedItems.size === 0}
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
