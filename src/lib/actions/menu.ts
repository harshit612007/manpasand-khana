'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { Menu } from '@/models/Menu'
import { MenuExtra } from '@/models/MenuExtra'

async function verifyOwner() {
  await dbConnect()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await User.findOne({ supabaseId: user.id })
  if (profile?.role !== 'owner') throw new Error("Unauthorized")

  return { user, supabase }
}

export async function createOrUpdateMenu(formData: FormData) {
  const { supabase } = await verifyOwner()

  const itemName = formData.get('item_name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const available = formData.get('available') === 'on'
  const date = formData.get('date') as string || new Date().toISOString().split('T')[0]
  const imageFile = formData.get('image') as File | null
  const itemsStr = formData.get('items') as string
  let items = []
  if (itemsStr) {
    try { items = JSON.parse(itemsStr) } catch(e) {}
  }

  let imageUrl = formData.get('existing_image_url') as string | null

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${date}-${Math.random()}.${fileExt}`
    
    // We keep Supabase for Storage as it's not the database
    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(`${date}/${fileName}`, imageFile)

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(`${date}/${fileName}`)
      imageUrl = publicUrl
    }
  }

  const existingMenu = await Menu.findOne({ date })

  if (existingMenu) {
    await Menu.updateOne({ _id: existingMenu._id }, { item_name: itemName, description, price, available, image_url: imageUrl, items })
  } else {
    await Menu.create({ date, item_name: itemName, description, price, available, image_url: imageUrl, items })
  }

  revalidatePath('/admin/menu')
  revalidatePath('/dashboard')
}

export async function addMenuExtra(menuId: string, name: string, price: number) {
  await verifyOwner()
  await MenuExtra.create({ menuId, name, price })
  revalidatePath('/admin/menu')
  revalidatePath('/dashboard')
}

export async function deleteMenuExtra(extraId: string) {
  await verifyOwner()
  await MenuExtra.findByIdAndDelete(extraId)
  revalidatePath('/admin/menu')
  revalidatePath('/dashboard')
}
