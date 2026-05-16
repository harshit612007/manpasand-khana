import { createClient } from '@/lib/supabase/server'

export async function calculateDues(userId: string): Promise<number> {
  const supabase = await createClient()

  // Sum all orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('user_id', userId)
    .eq('status', 'delivered')

  if (ordersError) throw ordersError

  const totalOrdered = orders.reduce((sum, order) => sum + Number(order.total_amount), 0)

  // Sum all payments
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount')
    .eq('user_id', userId)

  if (paymentsError) throw paymentsError

  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

  const dues = totalOrdered - totalPaid
  return Math.max(0, dues)
}
