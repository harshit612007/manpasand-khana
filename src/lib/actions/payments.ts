'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { Payment } from '@/models/Payment'

export async function addPayment(userId: string, amount: number, notes?: string) {
  await dbConnect()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await User.findOne({ supabaseId: user.id })
  if (profile?.role !== 'owner') throw new Error("Unauthorized")

  await Payment.create({
    user_id: userId,
    amount,
    notes,
    added_by: user.id
  })

  revalidatePath('/admin/payments')
  revalidatePath('/admin/dashboard')
}
