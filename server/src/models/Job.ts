import { model, Schema } from 'mongoose';

export type JobDocument = {
  id: string;
  role: string;
  company: string;
  experience: string;
  location: string;
  employmentType: string;
  skills: string[];
  description: string;
  requirements: string[];
  applicationUrl: string;
  postedBy: string;
  postedAt: string;
};

const jobSchema = new Schema<JobDocument>({
  id: { type: String, required: true, unique: true }, role: { type: String, required: true }, company: { type: String, required: true },
  experience: { type: String, required: true }, location: { type: String, required: true }, employmentType: { type: String, required: true },
  skills: [String], description: { type: String, required: true }, requirements: [String], applicationUrl: { type: String, required: true },
  postedBy: { type: String, required: true }, postedAt: { type: String, required: true },
}, { timestamps: true });

export const Job = model<JobDocument>('Job', jobSchema);