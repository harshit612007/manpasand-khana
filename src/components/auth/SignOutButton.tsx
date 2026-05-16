'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button 
      onClick={handleSignOut}
      className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors w-full"
    >
      <LogOut className="w-5 h-5 md:w-6 md:h-6" />
      <span className="text-[10px] md:text-sm font-semibold">Sign out</span>
    </button>
  )
}
