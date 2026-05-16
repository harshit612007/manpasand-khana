import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  user_id: string; // Map to Supabase ID
  amount: number;
  notes?: string;
  added_by: string; // Supabase ID of owner
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema({
  user_id: { type: String, required: true },
  amount: { type: Number, required: true },
  notes: { type: String },
  added_by: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
