import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch owner settings
    const { data: settings, error: settingsError } = await supabase
      .from('owner_settings')
      .select('*')
      .single()

    if (settingsError || !settings || !settings.reminder_enabled) {
      return new Response(JSON.stringify({ message: "Reminders disabled or settings not found." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const reminderDays = settings.reminder_days || 10
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - reminderDays)

    // We need to calculate dues.
    // For simplicity in the edge function, we query all users and their orders/payments, or we can use a DB function.
    // Since we don't have a DB function defined, we'll fetch orders and payments.
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')

    if (profilesError) throw profilesError;

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('user_id, total_amount, created_at')
      .eq('status', 'delivered') // Only count delivered orders

    if (ordersError) throw ordersError;

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('user_id, amount')

    if (paymentsError) throw paymentsError;

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is missing")
    }

    let emailsSent = 0;

    for (const profile of profiles) {
      const userOrders = orders.filter(o => o.user_id === profile.id)
      const userPayments = payments.filter(p => p.user_id === profile.id)

      const totalOrdered = userOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
      const totalPaid = userPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
      
      const dues = Math.max(0, totalOrdered - totalPaid)

      if (dues > 0) {
        // Check if oldest unpaid order is older than reminderDays
        // Simple heuristic: if totalPaid < totalOrdered, we sort orders by date
        userOrders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        
        let runningPaid = totalPaid;
        let oldestUnpaidDate = null;
        
        for (const order of userOrders) {
          if (runningPaid >= Number(order.total_amount)) {
            runningPaid -= Number(order.total_amount);
          } else {
            oldestUnpaidDate = new Date(order.created_at);
            break;
          }
        }

        if (oldestUnpaidDate && oldestUnpaidDate < cutoffDate) {
          // Send email
          const htmlContent = `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Manpasand Khana - Dues Reminder</h2>
              <p>Hello ${profile.name},</p>
              <p>${settings.reminder_message}</p>
              <p><strong>Current Dues: ₹${dues}</strong></p>
              <p>Please contact the owner at ${settings.phone} to confirm your payment.</p>
              <br/>
              <p>Thank you!</p>
            </div>
          `;

          const emailReq = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Manpasand Khana <noreply@resend.dev>', // Needs actual verified domain on Resend
              to: [profile.email],
              subject: 'Manpasand Khana — Dues Reminder',
              html: htmlContent
            })
          })

          if (emailReq.ok) {
            emailsSent++;
          } else {
            console.error(`Failed to send email to ${profile.email}:`, await emailReq.text())
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
