import { model, Schema } from 'mongoose';

export type ResumeDocument = {
  userId: string;
  filename: string;
  mimeType: string;
  size: number;
  content: Buffer;
  uploadedAt: Date;
};

const resumeSchema = new Schema<ResumeDocument>({
  userId: { type: String, required: true, index: true },
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  content: { type: Buffer, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export const Resume = model<ResumeDocument>('Resume', resumeSchema);