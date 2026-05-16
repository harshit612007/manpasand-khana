import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  user_id: string;
  user_name: string;
  message: string;
  chat_date: string;
  createdAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
  user_id: { type: String, required: true },
  user_name: { type: String, required: true },
  message: { type: String, required: true },
  chat_date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
