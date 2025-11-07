
import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  emailVerified: boolean;
  password?: string; // Password is now optional as it's handled by Firebase
  lastLogin?: Date;
  role: 'citizen' | 'authority' | 'center';
  profile?: {
    bio?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
  };
}

const ProfileSchema: Schema = new Schema({
  bio: { type: String },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
}, { _id: false });

const UserSchema: Schema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  displayName: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  password: { type: String, required: false, select: false }, // No longer required, handled by Firebase
  lastLogin: { type: Date },
  role: { 
    type: String, 
    enum: ['citizen', 'authority', 'center'], 
    default: 'citizen',
    required: true
  },
  profile: { type: ProfileSchema }
}, { timestamps: true });

export default models.User || model<IUser>('User', UserSchema);
