import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { UtensilsCrossed } from 'lucide-react'

type Menu = {
  id: string
  item_name: string
  price: number
  description: string
  image_url: string
}

export function MenuCard({ menu }: { menu: Menu }) {
  return (
    <Card className="overflow-hidden shadow-md border-border">
      <div className="relative h-48 md:h-64 w-full bg-muted flex items-center justify-center">
        {menu.image_url ? (
          <Image 
            src={menu.image_url} 
            alt={menu.item_name} 
            fill 
            className="object-cover"
          />
        ) : (
          <UtensilsCrossed className="w-16 h-16 text-muted-foreground opacity-50" />
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-extrabold text-foreground">{menu.item_name}</h2>
          <span className="text-xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            ₹{menu.price}
          </span>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {menu.description}
        </p>
      </CardContent>
    </Card>
  )
}
