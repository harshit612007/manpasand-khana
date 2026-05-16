import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, ClipboardList, CreditCard, MessageSquare, Star, Utensils } from 'lucide-react'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await adminClient.from('profiles').select('name').eq('id', user.id).single()

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex justify-between items-center px-4 py-3 bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Utensils className="text-primary w-6 h-6" />
          <span className="font-extrabold text-primary text-lg">Manpasand</span>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 w-full md:w-64 md:relative md:h-screen bg-card border-t md:border-r border-border z-40">
        <div className="hidden md:flex items-center gap-2 px-6 py-6 border-b border-border">
          <Utensils className="text-primary w-8 h-8" />
          <span className="font-extrabold text-primary text-xl">Manpasand</span>
        </div>
        
        <ul className="flex md:flex-col justify-around md:justify-start px-2 py-2 md:p-4 gap-2">
          <li>
            <Link href="/dashboard" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs md:text-sm font-semibold">Today's Menu</span>
            </Link>
          </li>
          <li>
            <Link href="/orders" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ClipboardList className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs md:text-sm font-semibold">Orders</span>
            </Link>
          </li>
          <li>
            <Link href="/billing" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs md:text-sm font-semibold">Billing</span>
            </Link>
          </li>
          <li>
            <Link href="/chat" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs md:text-sm font-semibold">Chat</span>
            </Link>
          </li>
          <li>
            <Link href="/reviews" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Star className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs md:text-sm font-semibold">Reviews</span>
            </Link>
          </li>
          
          <li className="mt-auto hidden md:block pt-4 border-t border-border w-full">
            <div className="px-3 pb-4">
              <p className="text-xs text-muted-foreground truncate">Logged in as:</p>
              <p className="text-sm font-bold truncate text-foreground">{profile?.name || user.email}</p>
            </div>
          </li>
          
          <li className="md:w-full">
            <SignOutButton />
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
