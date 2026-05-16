import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  supabaseId: string;
  role: 'owner' | 'customer';
  name: string;
  email: string;
  address?: string;
  phone?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  supabaseId: { type: String, required: true, unique: true },
  role: { type: String, enum: ['owner', 'customer'], default: 'customer' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
