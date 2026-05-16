'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { QrCode, Phone, MessageCircle } from 'lucide-react'

export function GPayModal({ 
  gpayQrUrl, 
  phone, 
  whatsapp 
}: { 
  gpayQrUrl: string | null, 
  phone: string | null, 
  whatsapp: string | null 
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button size="lg" className="w-full text-lg rounded-full py-6 shadow-md hover:shadow-lg transition-all">
            <QrCode className="w-6 h-6 mr-2" />
            Pay Now via UPI
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-extrabold text-foreground">Scan to Pay</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          <p className="text-center text-muted-foreground font-medium">
            Scan using any UPI app (GPay, PhonePe, Paytm, etc.)
          </p>

          <div className="relative w-64 h-64 bg-white rounded-xl shadow-inner border border-border p-2">
            {gpayQrUrl ? (
              <Image 
                src={gpayQrUrl} 
                alt="UPI QR Code" 
                fill 
                className="object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <QrCode className="w-16 h-16 opacity-50 mb-2" />
                <span className="text-sm">QR Code not set</span>
              </div>
            )}
          </div>

          <div className="w-full space-y-4 pt-4 border-t border-border">
            <p className="text-center text-sm font-bold text-foreground">After paying, contact owner to confirm:</p>
            
            <div className="flex flex-col gap-3">
              {whatsapp && (
                <a 
                  href={`https://wa.me/91${whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Hi, I have paid my dues for Manpasand Khana.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-full font-bold transition-colors shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp to Confirm
                </a>
              )}
              
              {phone && (
                <a 
                  href={`tel:${phone.replace(/\D/g,'')}`}
                  className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-muted py-3 px-4 rounded-full font-bold transition-colors border border-border shadow-sm"
                >
                  <Phone className="w-5 h-5" />
                  Call {phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
