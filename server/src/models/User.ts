import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: String,
  targetRoles: [String],
  targetLocations: [String],
  skills: [String],
}, { timestamps: true });

export const User = model('User', userSchema);
