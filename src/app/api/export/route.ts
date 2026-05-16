import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'owner') return new Response('Unauthorized', { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const { data: orders } = await adminClient
    .from('orders')
    .select('*, profiles(name, phone, address), menus(item_name)')
    .gte('created_at', `${today}T00:00:00.000Z`)

  if (!orders) return new Response('No data', { status: 400 })

  const headers = ['Order ID', 'Customer Name', 'Phone', 'Address', 'Item', 'Extras', 'Quantity', 'Status', 'Total Amount', 'Notes']
  const rows = orders.map(o => {
    const extrasList = Array.isArray(o.extras) ? o.extras.map((e: any) => e.name).join(' | ') : ''

    return [
      o.id,
      o.profiles?.name || '',
      o.profiles?.phone || '',
      o.profiles?.address || '',
      o.menus?.item_name || '',
      extrasList,
      o.quantity,
      o.status,
      o.total_amount,
      o.notes || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\n')

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="manpasand-orders-${today}.csv"`
    }
  })
}
