
import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IStaff extends Document {
  centerId: mongoose.Schema.Types.ObjectId;
  name: string;
  role: 'Nurse' | 'Administrator' | 'Support Staff';
  contact: string;
  assigned_on: Date;
}

const StaffSchema: Schema = new Schema({
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center', required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['Nurse', 'Administrator', 'Support Staff'] 
  },
  contact: { type: String, required: true },
}, {
    timestamps: { createdAt: 'assigned_on', updatedAt: 'updatedAt' }
});

export default models.Staff || model<IStaff>('Staff', StaffSchema);
