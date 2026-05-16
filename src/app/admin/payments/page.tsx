import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { AddPaymentSheet } from '@/components/owner/AddPaymentSheet'
import { AlertCircle } from 'lucide-react'

export default async function OwnerPayments() {
  const supabase = await createClient()

  // Fetch all customers
  const { data: customers } = await supabase
    .from('profiles')
    .select('id, name, phone')
    .eq('role', 'customer')

  // Fetch all orders to calculate dues
  // In a real large app, this should be an RPC call returning aggregated dues per customer.
  const { data: allOrders } = await supabase
    .from('orders')
    .select('user_id, total_amount, created_at')
    .eq('status', 'delivered')
    .order('created_at', { ascending: false })

  const { data: allPayments } = await supabase
    .from('payments')
    .select('user_id, amount')

  const customersWithDues = customers?.map(customer => {
    const customerOrders = allOrders?.filter(o => o.user_id === customer.id) || []
    const customerPayments = allPayments?.filter(p => p.user_id === customer.id) || []

    const totalOrdered = customerOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
    const totalPaid = customerPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const dues = Math.max(0, totalOrdered - totalPaid)
    
    const lastOrderDate = customerOrders.length > 0 ? customerOrders[0].created_at : null

    return { ...customer, dues, lastOrderDate }
  }).filter(c => c.dues > 0).sort((a, b) => b.dues - a.dues) || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
                        Last Order: {new Date(customer.lastOrderDate).toLocaleDateString()}
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
    </div>
  )
}
