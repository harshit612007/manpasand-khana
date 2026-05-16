import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { Order } from '@/models/Order'
import { Payment } from '@/models/Payment'
import { Menu } from '@/models/Menu'

export async function GET(request: Request) {
  await dbConnect()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const profile = await User.findOne({ supabaseId: user.id })
  if (profile?.role !== 'owner') return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'orders'
  const range = searchParams.get('range') || 'all'

  let dateFilter = {}
  if (range === '10days') {
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    dateFilter = { createdAt: { $gte: tenDaysAgo } }
  } else if (range === 'month') {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    dateFilter = { createdAt: { $gte: startOfMonth } }
  }

  let csvContent = ''
  let filename = `manpasand-export-${type}.csv`

  if (type === 'orders') {
    const orders = await Order.find(dateFilter).sort({ createdAt: -1 }).lean()
    
    // Fetch related users and menus
    const userIds = [...new Set(orders.map(o => o.userId))]
    const users = await User.find({ supabaseId: { $in: userIds } }).lean()
    const userMap = users.reduce((acc: any, u) => { acc[u.supabaseId] = u; return acc }, {})
    
    const menuIds = [...new Set(orders.map(o => o.menuId))]
    const menus = await Menu.find({ _id: { $in: menuIds } }).lean()
    const menuMap = menus.reduce((acc: any, m) => { acc[m._id.toString()] = m; return acc }, {})

    const headers = ['Date', 'Order ID', 'Customer Name', 'Phone', 'Address', 'Item', 'Extras', 'Excluded Items', 'Quantity', 'Status', 'Total Amount', 'Notes']
    const rows = orders.map(o => {
      const customer = userMap[o.userId] || {}
      const menu = menuMap[o.menuId] || {}
      const extrasList = Array.isArray(o.extras) ? o.extras.map((e: any) => e.name).join(' | ') : ''
      const excludedList = Array.isArray(o.excludedItems) ? o.excludedItems.map((e: any) => e.name).join(' | ') : ''
      
      return [
        new Date(o.createdAt).toLocaleDateString(),
        o._id?.toString(),
        customer.name || '',
        customer.phone || '',
        customer.address || '',
        menu.item_name || '',
        extrasList,
        excludedList,
        o.quantity,
        o.status,
        o.totalAmount,
        o.notes || ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })
    csvContent = [headers.join(','), ...rows].join('\n')

  } else if (type === 'payments') {
    const payments = await Payment.find(dateFilter).sort({ createdAt: -1 }).lean()
    
    const userIds = [...new Set(payments.map(p => p.userId))]
    const users = await User.find({ supabaseId: { $in: userIds } }).lean()
    const userMap = users.reduce((acc: any, u) => { acc[u.supabaseId] = u; return acc }, {})

    const headers = ['Date', 'Payment ID', 'Customer Name', 'Amount (₹)', 'Method', 'Notes']
    const rows = payments.map(p => {
      const customer = userMap[p.userId] || {}
      return [
        new Date(p.createdAt).toLocaleDateString(),
        p._id?.toString(),
        customer.name || '',
        p.amount,
        p.paymentMethod,
        p.notes || ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })
    csvContent = [headers.join(','), ...rows].join('\n')

  } else if (type === 'dues') {
    const users = await User.find({ role: 'customer' }).lean()
    const allOrders = await Order.find().lean()
    const allPayments = await Payment.find().lean()

    const headers = ['Customer Name', 'Phone', 'Address', 'Total Ordered (₹)', 'Total Paid (₹)', 'Pending Dues (₹)']
    const rows = users.map(u => {
      const userOrders = allOrders.filter(o => o.userId === u.supabaseId && o.status !== 'cancelled')
      const userPayments = allPayments.filter(p => p.userId === u.supabaseId)
      
      const totalOrdered = userOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      const totalPaid = userPayments.reduce((sum, p) => sum + p.amount, 0)
      const pendingDues = totalOrdered - totalPaid

      return [
        u.name || '',
        u.phone || '',
        u.address || '',
        totalOrdered,
        totalPaid,
        pendingDues
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    }).filter(row => row.split(',')[5] !== '"0"') // Optionally filter out zero dues, but let's keep all or just > 0. Let's keep all for completeness, wait, filtering out 0 is better. Let's filter out 0.
    
    csvContent = [headers.join(','), ...rows].join('\n')
  }

  if (!csvContent) {
    return new Response('No data found or invalid type', { status: 400 })
  }

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}
