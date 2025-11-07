
'use server'

import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import Citizen from "@/models/Citizen";
import QRCode from 'qrcode';

const formSchema = z.object({
  idNumber: z.string().nonempty("ID Number is required"),
  day: z.string().nonempty("Day is required"),
  month: z.string().nonempty("Month is required"),
  year: z.string().nonempty("Year is required"),
});

export async function searchCitizen(formData: unknown) {
  const result = formSchema.safeParse(formData);

  if (!result.success) {
    const errorMessages = result.error.errors.map(e => e.message).join(', ');
    return { success: false, error: `Invalid form data: ${errorMessages}` };
  }
  
  const { idNumber, day, month, year } = result.data;
  const searchDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  try {
    await dbConnect();

    // Find citizen by ID number and exact date of birth
    const citizen = await Citizen.findOne({ 
        idNumber: idNumber,
        dateOfBirth: {
            $gte: new Date(searchDate.setHours(0,0,0,0)),
            $lt: new Date(searchDate.setHours(23,59,59,999))
        }
    }).lean();

    if (!citizen) {
      return { success: false, error: "No citizen found matching the provided details." };
    }

    // Generate QR Code
    const cardData = {
        name: citizen.fullName,
        id: citizen._id.toString(),
        dob: citizen.dateOfBirth.toISOString().split('T')[0],
        status: 'Fully Vaccinated', // Placeholder status
    };

    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(cardData));

    const responseData = {
        name: citizen.fullName,
        dateOfBirth: citizen.dateOfBirth,
        idType: citizen.idType,
        idNumber: citizen.idNumber,
        status: 'Fully Vaccinated', // Placeholder
        qrCodeUrl: qrCodeUrl,
    };

    return { success: true, data: JSON.parse(JSON.stringify(responseData)) };

  } catch (error: any) {
    console.error("Search citizen error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
