'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { ChatMessage } from '@/models/ChatMessage'

export async function sendMessage(message: string) {
  await dbConnect()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await User.findOne({ supabaseId: user.id })

  if (!profile) throw new Error("Profile not found")

  await ChatMessage.create({
    user_id: user.id,
    user_name: profile.name,
    message,
    chat_date: new Date().toISOString().split('T')[0]
  })

  revalidatePath('/chat')
}
