import mongoose, { Schema, type Document } from 'mongoose';

export interface IMessageContent {
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'system';
  text?: string;
  mediaUrl?: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
  location?: { lat: number; lng: number };
}

export interface IMessageSender {
  type: 'contact' | 'ai' | 'agent' | 'system';
  id: string;
  name?: string;
}

export interface IAiMetadata {
  model: string;
  confidence: number;
  intent?: string;
  sentiment?: number;
  sources?: Array<{ chunkId: string; score: number; text?: string }>;
  tokensUsed?: { prompt: number; completion: number; total: number };
  responseTimeMs: number;
}

export interface IMessage extends Document {
  conversationId: string;
  tenantId: string;
  sender: IMessageSender;
  content: IMessageContent;
  aiMetadata?: IAiMetadata;
  readBy: Array<{ userId: string; readAt: Date }>;
  isEdited: boolean;
  isDeleted: boolean;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    sender: {
      type: {
        type: String,
        enum: ['contact', 'ai', 'agent', 'system'],
        required: true,
      },
      id: { type: String, required: true },
      name: { type: String },
    },
    content: {
      type: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'system'],
        required: true,
      },
      text: { type: String },
      mediaUrl: { type: String },
      mimeType: { type: String },
      fileName: { type: String },
      fileSize: { type: Number },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    aiMetadata: {
      model: { type: String },
      confidence: { type: Number },
      intent: { type: String },
      sentiment: { type: Number },
      sources: [
        {
          chunkId: { type: String },
          score: { type: Number },
          text: { type: String },
        },
      ],
      tokensUsed: {
        prompt: { type: Number },
        completion: { type: Number },
        total: { type: Number },
      },
      responseTimeMs: { type: Number },
    },
    readBy: [
      {
        userId: { type: String, required: true },
        readAt: { type: Date, default: Date.now },
      },
    ],
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    replyToId: { type: String },
  },
  {
    timestamps: true,
    collection: 'messages',
  },
);

// Compound indexes
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ tenantId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, 'sender.type': 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
