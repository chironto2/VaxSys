
'use server'

import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import Citizen from "@/models/Citizen";

const formSchema = z.object({
  fullName: z.string().nonempty("Full Name is required"),
  day: z.string().nonempty("Day is required"),
  month: z.string().nonempty("Month is required"),
  year: z.string().nonempty("Year is required"),
  idType: z.enum(["nid", "passport", "birth_certificate"]),
  idNumber: z.string().nonempty("ID Number is required"),
  contact: z.string().nonempty("Email or Mobile No. is required"),
});

export async function registerCitizen(formData: unknown) {
  const result = formSchema.safeParse(formData);

  if (!result.success) {
    const errorMessages = result.error.errors.map(e => e.message).join(', ');
    return { success: false, error: `Invalid form data: ${errorMessages}` };
  }

  const { fullName, day, month, year, idType, idNumber, contact } = result.data;
  
  try {
    await dbConnect();

    // Check if a citizen with this ID already exists
    const existingCitizen = await Citizen.findOne({ idType, idNumber });
    if (existingCitizen) {
      return { success: false, error: "A citizen with this identification number is already registered." };
    }
    
    const dateOfBirth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const newCitizen = new Citizen({
      fullName,
      dateOfBirth,
      idType,
      idNumber,
      contact,
    });

    await newCitizen.save();

    return { success: true };

  } catch (error: any) {
    console.error("Citizen registration error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

    