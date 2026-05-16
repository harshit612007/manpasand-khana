import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { updateOwnerSettings } from '@/lib/actions/settings'
import Image from 'next/image'

export default async function OwnerSettings() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('owner_settings')
    .select('*')
    .limit(1)
    .single()

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Store Settings</h1>
        <p className="text-muted-foreground">Configure payment details, contact info, and automated reminders.</p>
      </div>

      <form action={updateOwnerSettings} className="space-y-8">
        <input type="hidden" name="existing_gpay_qr_url" value={settings?.gpay_qr_url || ''} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payment & Contact Settings */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Contact & Payment</CardTitle>
              <CardDescription>How customers will contact and pay you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Calls)</Label>
                <Input id="phone" name="phone" defaultValue={settings?.phone} placeholder="e.g. 9876543210" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input id="whatsapp" name="whatsapp" defaultValue={settings?.whatsapp} placeholder="e.g. 9876543210" />
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <Label htmlFor="gpay_qr">UPI / GPay QR Code Image</Label>
                {settings?.gpay_qr_url && (
                  <div className="mb-2 relative w-32 h-32 rounded-lg overflow-hidden border border-border p-2 bg-white">
                    <Image src={settings.gpay_qr_url} alt="Current QR" fill className="object-contain p-2" />
                  </div>
                )}
                <Input id="gpay_qr" name="gpay_qr" type="file" accept="image/*" />
                <p className="text-xs text-muted-foreground">Upload your UPI QR code so customers can scan and pay.</p>
              </div>
            </CardContent>
          </Card>

          {/* Automated Reminders Settings */}
          <Card className="border-border shadow-sm h-fit">
            <CardHeader>
              <CardTitle>Automated Reminders</CardTitle>
              <CardDescription>Configure when and how overdue reminders are sent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border border-border p-4 rounded-xl bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="reminder_enabled" className="text-base">Enable Reminders</Label>
                  <p className="text-xs text-muted-foreground">Send emails to customers with dues.</p>
                </div>
                <Switch id="reminder_enabled" name="reminder_enabled" defaultChecked={settings?.reminder_enabled ?? true} value="on" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_days">Overdue Threshold (Days)</Label>
                <Input id="reminder_days" name="reminder_days" type="number" min="1" defaultValue={settings?.reminder_days || 10} />
                <p className="text-xs text-muted-foreground">Remind if oldest unpaid order is older than this.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_message">Reminder Message</Label>
                <Textarea 
                  id="reminder_message" 
                  name="reminder_message" 
                  defaultValue={settings?.reminder_message || 'Dear customer, you have pending dues. Please clear at your earliest.'} 
                  rows={4} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="w-full md:w-auto px-8 rounded-full font-bold">
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
