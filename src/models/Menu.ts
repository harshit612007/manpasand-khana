import mongoose, { Schema, Document } from 'mongoose';

export interface IMenu extends Document {
  date: string;
  item_name: string;
  description: string;
  price: number;
  available: boolean;
  image_url?: string;
  items: { id: string; name: string }[]; // New: specific items from full course
  createdAt: Date;
}

const MenuSchema: Schema = new Schema({
  date: { type: String, required: true },
  item_name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  image_url: { type: String },
  items: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

export const Menu = mongoose.models.Menu || mongoose.model<IMenu>('Menu', MenuSchema);
