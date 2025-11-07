
import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface ICitizen extends Document {
  fullName: string;
  dateOfBirth: Date;
  idType: 'nid' | 'passport' | 'birth_certificate';
  idNumber: string;
  contact: string; // Can be email or phone
}

const CitizenSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  idType: { 
    type: String, 
    required: true, 
    enum: ['nid', 'passport', 'birth_certificate'] 
  },
  idNumber: { type: String, required: true },
  contact: { type: String, required: true },
}, { 
  timestamps: true,
  // Create a compound index to ensure uniqueness of idType and idNumber combination
  indexes: [{ fields: { idType: 1, idNumber: 1 }, unique: true }]
});

export default models.Citizen || model<ICitizen>('Citizen', CitizenSchema);

    