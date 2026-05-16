'use client'

import { useState, useTransition } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addPayment } from '@/lib/actions/payments'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'

export function AddPaymentSheet({ userId, userName, dues }: { userId: string, userName: string, dues: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)
    const notes = formData.get('notes') as string

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    startTransition(async () => {
      try {
        await addPayment(userId, amount, notes)
        toast.success(`Payment added for ${userName}`)
        setOpen(false)
      } catch (error: any) {
        toast.error(error.message || "Failed to add payment")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0 shadow-sm font-semibold">
          <Plus className="w-4 h-4 mr-1" /> Add Payment
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card w-full sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Record Payment</SheetTitle>
        </SheetHeader>
        
        <div className="bg-muted p-4 rounded-xl mb-6 flex justify-between items-center border border-border">
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Customer</p>
            <p className="font-extrabold text-foreground text-lg">{userName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-destructive font-bold uppercase tracking-wider">Current Dues</p>
            <p className="font-extrabold text-destructive text-lg">₹{dues}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Received (₹)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required placeholder={dues.toString()} defaultValue={dues} className="text-lg font-bold" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input id="notes" name="notes" placeholder="e.g. GPay, Cash, adjustment..." />
          </div>

          <div className="pt-4 border-t border-border">
            <Button type="submit" className="w-full h-12 text-lg rounded-full" disabled={isPending}>
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Payment"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
