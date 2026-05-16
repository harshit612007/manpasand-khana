'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
      <div className="bg-destructive/10 p-4 rounded-full">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md bg-muted p-4 rounded-lg text-sm border border-border">
        {error.message || "An unexpected error occurred while saving your settings."}
      </p>
      <div className="flex gap-4 mt-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.href = '/admin/settings'} variant="outline">
          Go Back
        </Button>
      </div>
    </div>
  )
}
