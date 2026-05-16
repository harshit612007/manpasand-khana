'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Loader2, TrendingUp, Trash } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteConfirmButtonProps {
  onDelete: () => Promise<void>
  label?: string
  description?: string
}

// Simple delete with single confirm (for payments, etc.)
export function DeleteConfirmButton({ onDelete, label = 'record', description }: DeleteConfirmButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await onDelete()
        toast.success(`${label} deleted successfully`)
        setConfirmOpen(false)
      } catch (e: any) {
        toast.error(e.message || 'Failed to delete')
      }
    })
  }

  if (confirmOpen) {
    return (
      <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 animate-in fade-in duration-150">
        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
        <span className="text-xs text-destructive font-medium flex-1">
          {description || `Delete this ${label}?`}
        </span>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => setConfirmOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 px-2 text-xs"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Delete'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-8 h-8 shrink-0"
      onClick={() => setConfirmOpen(true)}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}

interface OrderDeleteButtonProps {
  onDeleteKeepRevenue: () => Promise<void>
  onDeleteRemoveRevenue: () => Promise<void>
}

// Two-option delete for orders: keep in revenue vs fully remove
export function OrderDeleteButton({ onDeleteKeepRevenue, onDeleteRemoveRevenue }: OrderDeleteButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handle = (fn: () => Promise<void>, successMsg: string) => {
    startTransition(async () => {
      try {
        await fn()
        toast.success(successMsg)
        setConfirmOpen(false)
      } catch (e: any) {
        toast.error(e.message || 'Failed to delete')
      }
    })
  }

  if (confirmOpen) {
    return (
      <div className="flex flex-col gap-2 bg-destructive/5 border border-destructive/30 rounded-xl p-3 animate-in fade-in duration-150 w-full">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-xs font-semibold text-destructive">Delete this order?</span>
        </div>
        <p className="text-xs text-muted-foreground">Choose how to handle the revenue:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 border-green-500/40 text-green-700 hover:bg-green-500/10 hover:text-green-700"
            onClick={() => handle(onDeleteKeepRevenue, 'Order hidden — amount kept in revenue')}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
            Keep in Revenue
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 text-xs gap-1.5"
            onClick={() => handle(onDeleteRemoveRevenue, 'Order deleted — amount removed from revenue')}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash className="w-3 h-3" />}
            Remove from Revenue
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => setConfirmOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-8 h-8 shrink-0"
      onClick={() => setConfirmOpen(true)}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}
