
'use server';

import dbConnect from '@/lib/dbConnect';
import Center from '@/models/Center';
import Citizen from '@/models/Citizen';
import Vaccine from '@/models/Vaccine';
import Appointment from '@/models/Appointment';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';


// Action to get all necessary data for the dashboard
export async function getDashboardData(centerId: string) {
  try {
    await dbConnect();

    const center = await Center.findById(centerId).select('center_name email daily_capacity').lean();
    if (!center) {
      return { success: false, error: 'Center not found.' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      centerId: center._id,
      appointmentDate: { $gte: today, $lt: tomorrow }
    }).populate('citizenId', 'fullName').lean();

    const stock = await Vaccine.find({ centerId: centerId }).lean();

    const formattedAppointments = appointments.map(appt => ({
        _id: appt._id.toString(),
        // @ts-ignore
        citizenName: appt.citizenId ? appt.citizenId.fullName : 'Citizen Not Found',
        appointmentDate: new Date(appt.appointmentDate).toLocaleTimeString(),
        vaccineType: appt.vaccineType,
        doseNumber: appt.doseNumber,
        status: appt.status,
    }));

    const totalCitizens = await Citizen.countDocuments();
    
    const centerData = {
      _id: center._id.toString(),
      center_name: center.center_name,
      email: center.email,
      daily_capacity: center.daily_capacity,
    };

    return { 
        success: true, 
        data: {
            center: centerData,
            appointments: JSON.parse(JSON.stringify(formattedAppointments)),
            totalCitizens,
            stock: JSON.parse(JSON.stringify(stock)),
        } 
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { success: false, error: 'Failed to fetch dashboard data.' };
  }
}

// Action to confirm an appointment
export async function confirmAppointment(appointmentId: string) {
    try {
        await dbConnect();
        
        const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status: 'Scheduled' }, { new: true });
        
        if (!appointment) {
            return { success: false, error: 'Appointment not found.' };
        }

        // TODO: Implement email sending logic here.
        // For example, using a service like Nodemailer or SendGrid.
        // const citizen = await Citizen.findById(appointment.citizenId);
        // if (citizen && citizen.contact) {
        //   await sendConfirmationEmail(citizen.contact, appointment);
        // }
        
        revalidatePath('/center/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error confirming appointment:', error);
        return { success: false, error: 'An internal error occurred.' };
    }
}

// Action to mark a dose as administered
export async function markDoseAdministered(appointmentId: string, vaccineName: string) {
    try {
        await dbConnect();
        
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return { success: false, error: 'Appointment not found.' };
        }
        
        if (appointment.status === 'Pending') {
            return { success: false, error: 'Cannot mark a pending appointment as administered. Please confirm it first.' };
        }

        const vaccine = await Vaccine.findOne({ centerId: appointment.centerId, vaccineName: vaccineName });
        if (vaccine) {
           if (vaccine.remainingStock > 0) {
                vaccine.remainingStock -= 1;
                vaccine.usedDoses += 1;
                await vaccine.save();
           } else {
                return { success: false, error: `No stock available for ${vaccineName}.` };
           }
        } else {
             return { success: false, error: 'Vaccine stock not found for this center.' };
        }

        appointment.status = 'Administered';
        await appointment.save();
        
        revalidatePath('/center/dashboard');
        revalidatePath('/center/stock');
        return { success: true };
    } catch (error) {
        console.error('Error marking dose as administered:', error);
        return { success: false, error: 'An internal error occurred.' };
    }
}
