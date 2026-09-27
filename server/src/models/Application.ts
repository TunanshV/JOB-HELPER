import { model, Schema } from 'mongoose';

const applicationSchema = new Schema({
  userId: { type: String, required: true, index: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  sourceUrl: String,
  status: { type: String, enum: ['draft', 'applied', 'interview', 'offer', 'rejected'], default: 'draft' },
  answers: { type: Map, of: String },
}, { timestamps: true });

export const Application = model('Application', applicationSchema);
