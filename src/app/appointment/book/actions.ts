
'use server';

import dbConnect from '@/lib/dbConnect';
import Center from '@/models/Center';
import Citizen from '@/models/Citizen';
import Appointment from '@/models/Appointment';
import Vaccine from '@/models/Vaccine';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function getCenters() {
    try {
        await dbConnect();
        const centers = await Center.find({ verified: true }).select('center_name location').lean();
        return { success: true, centers: JSON.parse(JSON.stringify(centers)) };
    } catch (error) {
        return { success: false, error: 'Failed to fetch centers' };
    }
}

export async function getCitizenByIdNumber(idNumber: string) {
    try {
        await dbConnect();
        const citizen = await Citizen.findOne({ idNumber }).lean();
        if (!citizen) {
            return { success: false, error: 'Citizen not found.' };
        }
        return { success: true, citizen: JSON.parse(JSON.stringify(citizen)) };
    } catch (error) {
        return { success: false, error: 'Database error.' };
    }
}


export async function getAvailableVaccines(centerId: string) {
    try {
        await dbConnect();
        const vaccines = await Vaccine.find({ centerId: centerId, remainingStock: { $gt: 0 } }).select('vaccineName').lean();
        const vaccineNames = vaccines.map(v => v.vaccineName);
        return { success: true, vaccines: vaccineNames };
    } catch (error) {
        return { success: false, error: 'Failed to fetch available vaccines.' };
    }
}

const appointmentSchema = z.object({
    citizenId: z.string(),
    centerId: z.string(),
    vaccineType: z.string(),
    appointmentDate: z.string(),
    doseNumber: z.number(),
});


export async function bookAppointment(data: unknown) {
    const validation = appointmentSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Invalid appointment data.' };
    }
    
    const { citizenId, centerId, vaccineType, appointmentDate, doseNumber } = validation.data;

    try {
        await dbConnect();
        
        const center = await Center.findById(centerId);
        if (!center) {
            return { success: false, error: 'Center not found.' };
        }
        
        const date = new Date(appointmentDate);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const existingAppointments = await Appointment.countDocuments({
            centerId: centerId,
            appointmentDate: { $gte: startOfDay, $lt: endOfDay }
        });

        if (existingAppointments >= center.daily_capacity) {
            return { success: false, error: 'This center is fully booked for the selected date. Please choose another day.' };
        }
        
        const vaccineStock = await Vaccine.findOne({ centerId: centerId, vaccineName: vaccineType });
        if(!vaccineStock || vaccineStock.remainingStock <= 0) {
            return { success: false, error: 'The selected vaccine is out of stock at this center.' };
        }

        const newAppointment = new Appointment({
            citizenId,
            centerId,
            vaccineType,
            appointmentDate: startOfDay, // Store consistent time
            doseNumber,
            status: 'Pending',
        });

        await newAppointment.save();

        revalidatePath('/center/dashboard');

        return { success: true };

    } catch (error) {
        console.error('Error booking appointment', error);
        return { success: false, error: 'An unexpected error occurred while booking the appointment.' };
    }
}
