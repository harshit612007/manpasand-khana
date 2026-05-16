'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { OwnerSettings } from '@/models/OwnerSettings'

export async function updateOwnerSettings(formData: FormData) {
  await dbConnect()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await User.findOne({ supabaseId: user.id })
  if (profile?.role !== 'owner') throw new Error("Unauthorized")

  const phone = formData.get('phone') as string
  const whatsapp = formData.get('whatsapp') as string
  const reminderMessage = formData.get('reminder_message') as string
  const reminderDays = parseInt(formData.get('reminder_days') as string) || 10
  const reminderEnabled = formData.get('reminder_enabled') === 'on'
  const qrImageFile = formData.get('gpay_qr') as File | null

  let qrUrl = formData.get('existing_gpay_qr_url') as string | null

  if (qrImageFile && qrImageFile.size > 0) {
    const fileExt = qrImageFile.name.split('.').pop()
    const fileName = `gpay-qr-${Date.now()}.${fileExt}`

    // Use Admin Client to bypass RLS
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let { error: uploadError } = await adminClient.storage
      .from('owner-assets')
      .upload(fileName, qrImageFile)

    // If bucket doesn't exist, create it and retry
    if (uploadError && uploadError.message.includes('Bucket not found')) {
      await adminClient.storage.createBucket('owner-assets', { public: true })
      const retry = await adminClient.storage
        .from('owner-assets')
        .upload(fileName, qrImageFile)
      uploadError = retry.error
    }

    if (uploadError) {
      throw new Error(`Failed to upload QR Code: ${uploadError.message}. Make sure your Supabase project is active.`)
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('owner-assets')
      .getPublicUrl(fileName)
    qrUrl = publicUrl
  }

  const existingSettings = await OwnerSettings.findOne()

  if (existingSettings) {
    await OwnerSettings.updateOne({ _id: existingSettings._id }, {
      phone,
      whatsapp,
      reminder_message: reminderMessage,
      reminder_days: reminderDays,
      reminder_enabled: reminderEnabled,
      gpay_qr_url: qrUrl,
      updated_at: new Date()
    })
  } else {
    await OwnerSettings.create({
      phone,
      whatsapp,
      reminder_message: reminderMessage,
      reminder_days: reminderDays,
      reminder_enabled: reminderEnabled,
      gpay_qr_url: qrUrl
    })
  }

  revalidatePath('/admin/settings')
}
