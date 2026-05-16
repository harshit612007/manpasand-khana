import dbConnect from '@/lib/db/mongodb'
import { Order } from '@/models/Order'
import { Payment } from '@/models/Payment'

export async function calculateDues(userId: string): Promise<number> {
  await dbConnect()

  const orders = await Order.find({ user_id: userId, status: 'delivered' }).lean()
  const totalOrdered = orders.reduce((sum, order) => sum + order.total_amount, 0)

  const payments = await Payment.find({ user_id: userId }).lean()
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

  const dues = totalOrdered - totalPaid
  return Math.max(0, dues)
}
