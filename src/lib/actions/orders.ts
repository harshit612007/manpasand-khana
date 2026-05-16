'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { Menu } from '@/models/Menu'
import { Order } from '@/models/Order'

export async function createOrder(formData: FormData, extras: { id: string, name: string, price: number }[], excluded_items: { id: string, name: string, price?: number }[] = []) {
  await dbConnect()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const menuId = formData.get('menu_id') as string
  const quantity = parseInt(formData.get('quantity') as string) || 1
  const notes = formData.get('notes') as string

  // Fetch menu price
  const menu = await Menu.findById(menuId)
  if (!menu) throw new Error("Menu not found")

  const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0)
  const excludedTotal = excluded_items.reduce((sum, item) => sum + (item.price || 0), 0)
  
  const totalAmount = (Math.max(0, Number(menu.price) - excludedTotal) * quantity) + extrasTotal

  const order = await Order.create({
    user_id: user.id,
    menu_id: menuId,
    quantity,
    notes,
    extras,
    excluded_items,
    total_amount: totalAmount,
    status: 'pending'
  })

  revalidatePath('/dashboard')
  revalidatePath('/orders')
  return JSON.parse(JSON.stringify(order))
}

export async function updateOrderStatus(orderId: string, status: string) {
  await dbConnect()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await User.findOne({ supabaseId: user.id })
  if (profile?.role !== 'owner') throw new Error("Unauthorized")

  await Order.findByIdAndUpdate(orderId, { status })

  revalidatePath('/admin/orders')
  revalidatePath('/admin/dashboard')
}
