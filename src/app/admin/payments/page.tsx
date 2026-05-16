import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddPaymentSheet } from '@/components/owner/AddPaymentSheet'
import { AlertCircle, History } from 'lucide-react'
import dbConnect from '@/lib/db/mongodb'
import { User } from '@/models/User'
import { Order } from '@/models/Order'
import { Payment } from '@/models/Payment'
import { DeleteConfirmButton } from '@/components/owner/DeleteConfirmButton'
import { deletePayment } from '@/lib/actions/payments'

export default async function OwnerPayments() {
  await dbConnect()
  const supabase = await createClient()

  // Fetch all customers
  const customersDoc = await User.find({ role: 'customer' }).lean()
  const customers = customersDoc.map(c => ({ id: c.supabaseId, name: c.name, phone: c.phone }))

  // Fetch all orders to calculate dues
  const allOrders = await Order.find({ status: 'delivered' }).sort({ createdAt: -1 }).lean()
  const allPayments = await Payment.find().sort({ createdAt: -1 }).lean()

  const customersWithDues = customers.map(customer => {
    const customerOrders = allOrders.filter(o => o.user_id === customer.id)
    const customerPayments = allPayments.filter(p => p.user_id === customer.id)

    const totalOrdered = customerOrders.reduce((sum, o) => sum + o.total_amount, 0)
    const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0)
    const dues = Math.max(0, totalOrdered - totalPaid)
    
    const lastOrderDate = customerOrders.length > 0 ? customerOrders[0].createdAt : null

    return { ...customer, dues, lastOrderDate }
  }).filter(c => c.dues > 0).sort((a, b) => b.dues - a.dues)

  // For payment history: group by customer
  const paymentsByCustomer = allPayments.reduce((acc: any, p: any) => {
    const customer = customers.find(c => c.id === p.user_id)
    if (!customer) return acc
    if (!acc[p.user_id]) acc[p.user_id] = { customer, payments: [] }
    acc[p.user_id].payments.push({ ...p, id: p._id?.toString() })
    return acc
  }, {})

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Pending Dues */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Pending Payments</h1>
        <p className="text-muted-foreground">Manage customer dues and record payments.</p>
      </div>

      <div className="space-y-4">
        {customersWithDues.length > 0 ? (
          customersWithDues.map(customer => (
            <Card key={customer.id} className="border-border shadow-sm border-l-4 border-l-destructive overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">Phone: {customer.phone || 'N/A'}</p>
                    {customer.lastOrderDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last Order: {new Date(customer.lastOrderDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                    <div className="text-right flex-1 sm:flex-none">
                      <p className="text-xs font-bold text-destructive uppercase tracking-wider">Pending Dues</p>
                      <p className="text-2xl font-extrabold text-destructive">₹{customer.dues}</p>
                    </div>
                    
                    <AddPaymentSheet userId={customer.id} userName={customer.name} dues={customer.dues} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-green-500/5 border border-green-500/20 rounded-2xl text-center">
            <AlertCircle className="w-16 h-16 text-green-500 mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">All Clear!</h2>
            <p className="text-green-600 max-w-md">
              No customers have pending dues. Everyone is paid up.
            </p>
          </div>
        )}
      </div>

      {/* Payment History */}
      {Object.values(paymentsByCustomer).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">Payment History</h2>
          </div>
          <div className="space-y-4">
            {Object.values(paymentsByCustomer).map((group: any) => (
              <Card key={group.customer.id} className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">{group.customer.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">₹{payment.amount}</span>
                          {payment.notes && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{payment.notes}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' }).format(new Date(payment.createdAt))}
                        </p>
                      </div>
                      <DeleteConfirmButton
                        label="payment"
                        description={`Delete ₹${payment.amount} payment for ${group.customer.name}? This will increase their dues.`}
                        onDelete={async () => { 'use server'; await deletePayment(payment.id) }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
