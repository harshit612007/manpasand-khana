import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

// For Google Drive upload, we'd typically use googleapis, but in Deno Edge Functions
// it's easier to use raw REST calls with a JWT, or rely on a pre-bundled ESM.
// For demonstration, we'll outline the structure. A real implementation
// would use something like `https://esm.sh/googleapis`.
// import { google } from "https://esm.sh/googleapis@122.0.0"

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

    const googleKeyJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')

    if (!googleKeyJson || !folderId) {
      throw new Error("Missing Google credentials in environment variables.")
    }

    // 1. Fetch today's orders joined with profiles and menus
    const today = new Date().toISOString().split('T')[0]
    
    // We do multiple queries as joins in Supabase require foreign keys.
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*, profiles(name, email, address), menus(item_name, price)')
      .gte('created_at', `${today}T00:00:00.000Z`)

    if (ordersError) throw ordersError

    // 2. Generate CSV
    const headers = ['Date', 'Customer Name', 'Email', 'Address', 'Item', 'Extras', 'Quantity', 'Notes', 'Total Amount']
    const rows = orders.map(o => {
      // @ts-ignore
      const profile = o.profiles
      // @ts-ignore
      const menu = o.menus
      const extrasList = Array.isArray(o.extras) ? o.extras.map((e: any) => e.name).join(' | ') : ''
      
      return [
        new Date(o.created_at).toISOString(),
        profile?.name || '',
        profile?.email || '',
        profile?.address || '',
        menu?.item_name || '',
        extrasList,
        o.quantity,
        o.notes || '',
        o.total_amount
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')

    // 3. Authenticate with Google Drive and upload
    // Note: Implementing full JWT auth for Google in standard Deno edge function 
    // requires generating a signed JWT using the private key.
    // This is a placeholder for the actual upload logic using the REST API.
    
    /* 
    const credentials = JSON.parse(googleKeyJson)
    // Create JWT
    // Exchange JWT for Access Token
    // POST to https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart
    */

    return new Response(JSON.stringify({ success: true, message: "CSV Generated", rowsCount: rows.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
