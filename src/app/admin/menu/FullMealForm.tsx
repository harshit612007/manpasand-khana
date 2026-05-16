'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createOrUpdateMenu } from '@/lib/actions/menu'
import { Plus, X } from 'lucide-react'
import Image from 'next/image'

export default function FullMealForm({ menu, today, extrasTotal }: { menu: any, today: string, extrasTotal: number }) {
  const [items, setItems] = useState<{id: string, name: string}[]>(menu?.items || [])
  const [newItemName, setNewItemName] = useState('')

  const handleAddItem = () => {
    if (!newItemName.trim()) return
    setItems([...items, { id: Math.random().toString(36).substring(7), name: newItemName.trim() }])
    setNewItemName('')
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const fullMealPrice = Number(menu?.price ?? 0)

  return (
    <form action={createOrUpdateMenu} className="space-y-4">
      <input type="hidden" name="date" value={today} />
      <input type="hidden" name="existing_image_url" value={menu?.image_url || ''} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="space-y-2">
        <Label htmlFor="item_name">Meal Name</Label>
        <Input id="item_name" name="item_name" defaultValue={menu?.item_name} required placeholder="e.g. Punjabi Thali" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">What's Included</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={menu?.description}
          required
          placeholder="e.g. Dal Tadka, Jeera Rice, 4 Rotis..."
          rows={3}
        />
      </div>

      <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
        <Label>Specific Items in Full Course (Allow customers to remove)</Label>
        <div className="flex gap-2">
          <Input 
            value={newItemName} 
            onChange={(e) => setNewItemName(e.target.value)} 
            placeholder="e.g. Rice" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddItem()
              }
            }}
          />
          <Button type="button" onClick={handleAddItem} size="icon" variant="secondary"><Plus className="w-4 h-4" /></Button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-1 bg-background border border-border text-sm px-2 py-1 rounded-md">
                <span>{item.name}</span>
                <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Full Meal Price (₹)</Label>
        <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={menu?.price} required placeholder="e.g. 120" />
        {extrasTotal > 0 && (
          <p className="text-xs text-muted-foreground">
            Individual items sum: ₹{extrasTotal} — Full meal saves ₹{Math.max(0, extrasTotal - fullMealPrice)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Meal Photo (Optional)</Label>
        {menu?.image_url && (
          <div className="mb-2 relative w-full h-40 rounded-lg overflow-hidden border border-border">
            <Image src={menu.image_url} alt="Current Menu" fill className="object-cover" />
          </div>
        )}
        <Input id="image" name="image" type="file" accept="image/*" />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Switch id="available" name="available" defaultChecked={menu?.available ?? true} value="on" />
        <Label htmlFor="available">Available for ordering today</Label>
      </div>

      <Button type="submit" className="w-full mt-4">
        {menu ? 'Update Full Meal' : 'Publish Today\'s Menu'}
      </Button>
    </form>
  )
}
