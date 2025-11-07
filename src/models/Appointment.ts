
import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IAppointment extends Document {
  citizenId: mongoose.Schema.Types.ObjectId;
  centerId: mongoose.Schema.Types.ObjectId;
  appointmentDate: Date;
  vaccineType: string;
  doseNumber: number;
  status: 'Pending' | 'Scheduled' | 'Administered' | 'Cancelled';
}

const AppointmentSchema: Schema = new Schema({
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center', required: true },
    appointmentDate: { type: Date, required: true },
    vaccineType: { type: String, required: true },
    doseNumber: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Scheduled', 'Administered', 'Cancelled'], default: 'Pending' }
}, {
    timestamps: true
});

export default models.Appointment || model<IAppointment>('Appointment', AppointmentSchema);
