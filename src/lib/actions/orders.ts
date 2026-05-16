'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { Order } from '@/models/Order'
import { Menu } from '@/models/Menu'

export async function createOrder(
  formData: FormData,
  selectedItems: { id: string, name: string, price: number }[],
  totalAmount: number
) {
  await dbConnect()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const menuId = formData.get('menu_id') as string
  const quantity = parseInt(formData.get('quantity') as string) || 1
  const notes = formData.get('notes') as string
  const isBundle = formData.get('is_bundle') === 'true'

  // Server-side guard: block if menu is closed
  const menuDoc = await Menu.findById(menuId)
  if (!menuDoc) throw new Error("Menu not found")
  if (!menuDoc.available) throw new Error("Orders are closed. The owner has stopped accepting orders for today.")

  if (selectedItems.length === 0) throw new Error("Please select at least one item")

  const order = await Order.create({
    user_id: user.id,
    menu_id: menuId,
    quantity,
    notes,
    selected_items: selectedItems,
    is_bundle: isBundle,
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
  revalidatePath('/admin/payments')
  revalidatePath('/billing')
  revalidatePath('/orders')
}
