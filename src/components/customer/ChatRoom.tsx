'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/lib/actions/chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Clock } from 'lucide-react'

type Message = {
  id: string
  user_id: string
  user_name: string
  message: string
  created_at: string
}

export function ChatRoom({ currentUserId, initialMessages }: { currentUserId: string, initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isPending, setIsPending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Scroll to bottom on mount and on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    
    const channel = supabase
      .channel('chat_room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_date=eq.${today}`
        },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates if we already added it optimistically
            if (prev.find(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new as Message]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageText = newMessage
    setNewMessage('')
    setIsPending(true)

    try {
      await sendMessage(messageText)
    } catch (error) {
      console.error("Failed to send message", error)
      setNewMessage(messageText) // restore on fail
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col h-[70vh] md:h-[80vh] bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chat resets daily at midnight</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No messages today. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId
            return (
              <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-bold text-muted-foreground mb-1 ml-1">
                  {isOwn ? 'You' : msg.user_name}
                </span>
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    isOwn 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-muted text-foreground border border-border rounded-tl-none'
                  }`}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-background border-t border-border flex gap-2">
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-full border-border bg-muted/50"
          disabled={isPending}
        />
        <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={isPending || !newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
