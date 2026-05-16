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
    const today = new Date().toISOString().split('T')[0]

    // 1. Delete chat messages older than today
    const { count: deletedChats, error: chatError } = await supabase
      .from('chat_messages')
      .delete({ count: 'exact' })
      .lt('chat_date', today)

    if (chatError) throw chatError

    // 2. Delete old menu images to save storage
    let deletedImagesCount = 0;
    const { data: folders, error: folderError } = await supabase.storage.from('menu-images').list()
    
    if (!folderError && folders) {
      for (const folder of folders) {
        // If the folder is named as a date and is older than today
        if (folder.name.match(/^\d{4}-\d{2}-\d{2}$/) && folder.name < today) {
          const { data: files } = await supabase.storage.from('menu-images').list(folder.name)
          
          if (files && files.length > 0) {
            const pathsToRemove = files.map(f => `${folder.name}/${f.name}`)
            const { error: removeError } = await supabase.storage.from('menu-images').remove(pathsToRemove)
            
            if (!removeError) {
              deletedImagesCount += pathsToRemove.length;
            } else {
              console.error("Error removing files:", removeError)
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      deletedChats,
      deletedImagesCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

