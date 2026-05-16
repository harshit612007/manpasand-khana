'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteConfirmButtonProps {
  onDelete: () => Promise<void>
  label?: string
  description?: string
}

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
