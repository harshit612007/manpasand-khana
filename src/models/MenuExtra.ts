import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuExtra extends Document {
  menuId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  createdAt: Date;
}

const MenuExtraSchema: Schema = new Schema({
  menuId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const MenuExtra = mongoose.models.MenuExtra || mongoose.model<IMenuExtra>('MenuExtra', MenuExtraSchema);
