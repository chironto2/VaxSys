
import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IVaccine extends Document {
  centerId: mongoose.Schema.Types.ObjectId;
  vaccineName: string;
  totalStock: number;
  usedDoses: number;
  remainingStock: number;
  wastedDoses: number;
}

const VaccineSchema: Schema = new Schema({
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center', required: true },
  vaccineName: { type: String, required: true },
  totalStock: { type: Number, default: 0 },
  usedDoses: { type: Number, default: 0 },
  remainingStock: { type: Number, default: 0 },
  wastedDoses: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

// Ensure that a center cannot have two vaccines with the same name
VaccineSchema.index({ centerId: 1, vaccineName: 1 }, { unique: true });

export default models.Vaccine || model<IVaccine>('Vaccine', VaccineSchema);
