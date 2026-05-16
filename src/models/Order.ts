import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  user_id: string; // Maps to Supabase auth user.id
  menu_id: mongoose.Types.ObjectId;
  quantity: number;
  notes?: string;
  extras: { id: string; name: string; price: number }[];
  excluded_items: { id: string; name: string }[]; // New: user deselects items from full course
  total_amount: number;
  status: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  user_id: { type: String, required: true },
  menu_id: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
  quantity: { type: Number, default: 1 },
  notes: { type: String },
  extras: [{ id: String, name: String, price: Number }],
  excluded_items: [{ id: String, name: String }],
  total_amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
