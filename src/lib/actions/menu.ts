'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { Menu } from '@/models/Menu'
import { randomBytes } from 'crypto'

async function verifyOwner() {
  await dbConnect()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await User.findOne({ supabaseId: user.id })
  if (profile?.role !== 'owner') throw new Error("Unauthorized")

  return { user, supabase }
}

// Ensure today's menu document exists, return it
async function getOrCreateTodayMenu(date: string) {
  let menu = await Menu.findOne({ date })
  if (!menu) {
    menu = await Menu.create({ date, available: true, items: [] })
  }
  return menu
}

export async function addMenuItem(formData: FormData) {
  await verifyOwner()

  const date = formData.get('date') as string
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const description = (formData.get('description') as string) || ''

  if (!name || isNaN(price)) throw new Error('Name and price are required')

  const menu = await getOrCreateTodayMenu(date)
  const newItem = {
    id: randomBytes(8).toString('hex'),
    name,
    price,
    description,
    available: true,
  }

  await Menu.updateOne({ _id: menu._id }, { $push: { items: newItem } })

  revalidatePath('/admin/menu')
  revalidatePath('/dashboard')
}

export async function deleteMenuItem(menuId: string, itemId: string) {
  await verifyOwner()
  await Menu.updateOne({ _id: menuId }, { $pull: { items: { id: itemId } } })
  revalidatePath('/admin/menu')
  revalidatePath('/dashboard')
}

export async function setBundlePrice(menuId: string, bundlePrice: number | null) {
  await verifyOwner()
  await Menu.updateOne({ _id: menuId }, { bundle_price: bundlePrice ?? undefined })
  revalidatePath('/admin/menu')
  revalidatePath('/dashboard')
}

export async function toggleMenuAvailability(menuId: string, available: boolean) {
  await verifyOwner()
  await Menu.updateOne({ _id: menuId }, { available })
  revalidatePath('/admin/menu')
  revalidatePath('/dashboard')
}
