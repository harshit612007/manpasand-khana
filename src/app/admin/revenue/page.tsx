import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueChart } from '@/components/owner/RevenueChart'

export default async function OwnerRevenue() {
  const supabase = await createClient()

  const { data: allOrders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('status', 'delivered')
    .order('created_at', { ascending: true })

  // Aggregate by month (Mocked aggregation for frontend without complex SQL grouping)
  const monthlyRevenue: Record<string, number> = {}

  allOrders?.forEach(order => {
    const date = new Date(order.created_at)
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    const key = `${month} ${year}`

    if (!monthlyRevenue[key]) {
      monthlyRevenue[key] = 0
    }
    monthlyRevenue[key] += Number(order.total_amount)
  })

  // Format for Recharts
  const revenueData = Object.keys(monthlyRevenue).map(key => ({
    month: key,
    revenue: monthlyRevenue[key]
  }))

  const totalAllTimeRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Revenue Analytics</h1>
        <p className="text-muted-foreground">Detailed view of your income over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 shadow-lg bg-primary/5 md:col-span-1 flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="text-muted-foreground font-medium uppercase tracking-wider text-sm">All-Time Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-primary">₹{totalAllTimeRevenue}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
