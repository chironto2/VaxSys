
import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface ICenter extends Document {
  uid: string; // Firebase Auth UID
  center_name: string;
  email: string;
  phone: string;
  location: {
    district: string;
    address: string;
  };
  daily_capacity: number;
  role: 'center';
  registered_on: Date;
  updated_on: Date;
  verified: boolean;
}

const LocationSchema: Schema = new Schema({
  district: { type: String, required: true },
  address: { type: String, required: true },
}, { _id: false });

const CenterSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true },
  center_name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  location: { type: LocationSchema, required: true },
  daily_capacity: { type: Number, default: 100 },
  role: { type: String, required: true, default: 'center' },
  verified: { type: Boolean, default: false },
}, { 
  timestamps: { createdAt: 'registered_on', updatedAt: 'updated_on' }
});

export default models.Center || model<ICenter>('Center', CenterSchema);
