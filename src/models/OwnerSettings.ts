import mongoose, { Schema, Document } from 'mongoose';

export interface IOwnerSettings extends Document {
  phone?: string;
  whatsapp?: string;
  reminder_message?: string;
  reminder_days: number;
  reminder_enabled: boolean;
  gpay_qr_url?: string;
  updated_at: Date;
}

const OwnerSettingsSchema: Schema = new Schema({
  phone: { type: String },
  whatsapp: { type: String },
  reminder_message: { type: String },
  reminder_days: { type: Number, default: 10 },
  reminder_enabled: { type: Boolean, default: true },
  gpay_qr_url: { type: String },
  updated_at: { type: Date, default: Date.now },
});

export const OwnerSettings = mongoose.models.OwnerSettings || mongoose.model<IOwnerSettings>('OwnerSettings', OwnerSettingsSchema);
