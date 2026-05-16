import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, BookOpen, UtensilsCrossed, IndianRupee, Settings, Star } from 'lucide-react'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await adminClient.from('profiles').select('role, name').eq('id', user.id).single()
  if (profile?.role !== 'owner') redirect('/dashboard') // fallback to customer dashboard

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <header className="md:hidden flex justify-between items-center px-4 py-3 bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="text-primary w-6 h-6" />
          <span className="font-extrabold text-primary text-lg">Admin</span>
        </div>
      </header>

      <nav className="fixed bottom-0 w-full md:w-64 md:relative md:h-screen bg-card border-t md:border-r border-border z-40">
        <div className="hidden md:flex items-center gap-2 px-6 py-6 border-b border-border">
          <UtensilsCrossed className="text-primary w-8 h-8" />
          <span className="font-extrabold text-primary text-xl">Admin Panel</span>
        </div>
        
        <ul className="flex md:flex-col justify-around md:justify-start px-2 py-2 md:p-4 gap-2">
          <li>
            <Link href="/admin/dashboard" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-semibold">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/menu" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-semibold">Menu</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/orders" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <UtensilsCrossed className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-semibold">Orders</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/payments" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <IndianRupee className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-semibold">Payments</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/revenue" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-semibold">Revenue</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-semibold">Settings</span>
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

      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
