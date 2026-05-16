import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'

export async function POST(request: Request) {
  await dbConnect()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { address, phone } = await request.json()

  if (!address || !phone) {
    return NextResponse.json({ error: 'Address and phone are required' }, { status: 400 })
  }

  try {
    await User.updateOne({ supabaseId: user.id }, { address, phone })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
