import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  available: boolean;
}

export interface IMenu extends Document {
  date: string;
  available: boolean;
  bundle_price?: number; // Optional full-thali bundle discount price
  items: IMenuItem[];
  createdAt: Date;
}

const MenuItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  available: { type: Boolean, default: true },
}, { _id: false });

const MenuSchema: Schema = new Schema({
  date: { type: String, required: true, unique: true },
  available: { type: Boolean, default: true },
  bundle_price: { type: Number },
  items: [MenuItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Menu = mongoose.models.Menu || mongoose.model<IMenu>('Menu', MenuSchema);
