import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    await dbConnect()
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Check if profile exists using MongoDB
      const profile = await User.findOne({ supabaseId: user.id })

      if (!profile) {
        // Create profile
        const ownerEmail = process.env.OWNER_EMAIL
        const role = user.email?.toLowerCase() === ownerEmail?.toLowerCase() ? 'owner' : 'customer'

        await User.create({
          supabaseId: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email!,
          role: role
        })

        // Need onboarding for address if customer
        if (role === 'customer') {
          return NextResponse.redirect(`${origin}/onboarding`)
        } else {
          return NextResponse.redirect(`${origin}/admin/dashboard`)
        }
      } else {
        // Profile exists. Let's check if they are the owner and need a role upgrade
        if (user.email?.toLowerCase() === process.env.OWNER_EMAIL?.toLowerCase() && profile.role !== 'owner') {
          await User.updateOne({ supabaseId: user.id }, { role: 'owner' })
        } else if (!profile.address && profile.role !== 'owner') {
          // Profile exists but no address (and not owner)
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      // If user is owner, send to admin dashboard, else normal dashboard
      if (user.email?.toLowerCase() === process.env.OWNER_EMAIL?.toLowerCase()) {
        return NextResponse.redirect(`${origin}/admin/dashboard`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
