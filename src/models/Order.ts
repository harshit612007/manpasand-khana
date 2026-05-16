import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  user_id: string;
  menu_id: string;
  quantity: number;
  notes?: string;
  selected_items: { id: string; name: string; price: number }[];
  is_bundle: boolean;
  total_amount: number;
  status: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  user_id: { type: String, required: true },
  menu_id: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  notes: { type: String },
  selected_items: [{ id: String, name: String, price: Number }],
  is_bundle: { type: Boolean, default: false },
  total_amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
