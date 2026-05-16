import { createClient } from '@/lib/supabase/server'
import { ChatRoom } from '@/components/customer/ChatRoom'

export default async function CustomerChat() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const { data: initialMessages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_date', today)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Community Chat</h1>
        <p className="text-sm text-muted-foreground">Talk with the owner and other food lovers.</p>
      </div>

      <ChatRoom currentUserId={user.id} initialMessages={initialMessages || []} />
    </div>
  )
}
