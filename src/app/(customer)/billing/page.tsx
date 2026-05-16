import { createClient } from '@/lib/supabase/server'
import { calculateDues } from '@/lib/utils/billing'
import { GPayModal } from '@/components/customer/GPayModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import dbConnect from '@/lib/db/mongodb'
import { Payment } from '@/models/Payment'
import { OwnerSettings } from '@/models/OwnerSettings'

export default async function CustomerBilling() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  await dbConnect()

  const dues = await calculateDues(user.id)

  const rawPayments = await Payment.find({ user_id: user.id }).sort({ createdAt: -1 }).lean()
  const payments = rawPayments.map(p => ({
    ...p,
    id: p._id?.toString(),
    created_at: p.createdAt
  }))

  const settingsDoc = await OwnerSettings.findOne().lean()
  const settings = settingsDoc ? { ...settingsDoc, id: settingsDoc._id?.toString() } : null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Billing & Payments</h1>
        <p className="text-muted-foreground">Manage your dues and payment history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-primary/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10" />
          <CardHeader>
            <CardTitle className="text-xl text-muted-foreground font-semibold uppercase tracking-wider">
              Current Dues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-foreground">₹{dues}</span>
            </div>
            
            {dues > 0 ? (
              <GPayModal 
                gpayQrUrl={settings?.gpay_qr_url || null}
                phone={settings?.phone || null}
                whatsapp={settings?.whatsapp || null}
              />
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 text-green-700 p-4 rounded-xl font-bold text-center">
                All cleared! No pending dues.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments && payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment: any) => (
                  <div key={payment.id} className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border border-border">
                    <div>
                      <p className="font-bold text-foreground">Paid via {payment.method}</p>
                      <p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long' }).format(new Date(payment.created_at))}</p>
                      {payment.notes && <p className="text-xs text-muted-foreground mt-1">Note: {payment.notes}</p>}
                    </div>
                    <span className="font-extrabold text-green-600">₹{payment.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No payment history found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
