
'use server';

import dbConnect from '@/lib/dbConnect';
import Center from '@/models/Center';
import Vaccine from '@/models/Vaccine';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Action to get stock data for a center from the 'vaccines' collection
export async function getCenterStock(centerId: string) {
  try {
    await dbConnect();
    const stock = await Vaccine.find({ centerId: centerId }).lean();
    if (!stock) {
      return { success: false, error: 'No stock found for this center.' };
    }
    return { success: true, stock: JSON.parse(JSON.stringify(stock)) };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return { success: false, error: 'Failed to fetch stock data.' };
  }
}

// Schema for adding a new vaccine
const addVaccineSchema = z.object({
  vaccineName: z.string().min(1, 'Vaccine name is required.'),
  totalStock: z.number().min(0, 'Stock count must be a positive number.'),
});

// Action to add a new vaccine document to the 'vaccines' collection
export async function addVaccine(centerId: string, vaccineData: unknown) {
    const validationResult = addVaccineSchema.safeParse(vaccineData);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
      return { success: false, error: `Invalid stock data: ${errorMessages}` };
    }
    
    const { vaccineName, totalStock } = validationResult.data;

    try {
        await dbConnect();
        
        // Optional: Check if the center exists
        const center = await Center.findById(centerId);
        if (!center) {
            return { success: false, error: 'Center not found.' };
        }

        // Check if vaccine with the same name already exists for this center
        const existingVaccine = await Vaccine.findOne({ centerId, vaccineName });
        if (existingVaccine) {
            return { success: false, error: `A vaccine named '${vaccineName}' already exists in your inventory.` };
        }

        const newVaccine = new Vaccine({
          centerId: centerId,
          vaccineName: vaccineName,
          totalStock: totalStock,
          usedDoses: 0,
          remainingStock: totalStock, // Initially, remaining is same as total
          wastedDoses: 0,
        });
        
        await newVaccine.save();
        
        revalidatePath('/center/stock');
        revalidatePath('/center/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error adding new vaccine:', error);
        // Handle potential unique index violation gracefully
        if (error.code === 11000) {
             return { success: false, error: `A vaccine named '${vaccineName}' already exists.` };
        }
        return { success: false, error: 'An internal error occurred while adding the vaccine.' };
    }
}


// Schema for updating existing stock
const updateVaccineStockSchema = z.object({
  vaccineId: z.string(),
  remainingStock: z.number().min(0),
  usedDoses: z.number().min(0),
  wastedDoses: z.number().min(0),
});

// Action to update an existing vaccine's stock
export async function updateVaccineStock(vaccineData: unknown) {
    const validationResult = updateVaccineStockSchema.safeParse(vaccineData);

    if (!validationResult.success) {
      return { success: false, error: 'Invalid stock data for update.' };
    }
    const { vaccineId, ...stockLevels } = validationResult.data;
    
    try {
        await dbConnect();
        const vaccine = await Vaccine.findById(vaccineId);
        if (!vaccine) {
            return { success: false, error: 'Vaccine not found.' };
        }
        
        // Recalculate totalStock based on current levels
        const totalStock = stockLevels.remainingStock + stockLevels.usedDoses + stockLevels.wastedDoses;
        
        await Vaccine.updateOne(
            { _id: vaccineId },
            { 
                $set: {
                    remainingStock: stockLevels.remainingStock,
                    usedDoses: stockLevels.usedDoses,
                    wastedDoses: stockLevels.wastedDoses,
                    totalStock: totalStock,
                }
            }
        );

        revalidatePath('/center/stock');
        revalidatePath('/center/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating stock:', error);
        return { success: false, error: 'An internal error occurred while updating stock.' };
    }
}

// Action to delete a vaccine from stock
export async function deleteVaccineStock(vaccineId: string) {
    if (!vaccineId) {
        return { success: false, error: 'Vaccine ID is required.' };
    }
    try {
        await dbConnect();
        const result = await Vaccine.findByIdAndDelete(vaccineId);

        if (!result) {
            return { success: false, error: 'Vaccine not found.' };
        }
        
        revalidatePath('/center/stock');
        revalidatePath('/center/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error deleting vaccine stock:', error);
        return { success: false, error: 'An internal error occurred.' };
    }
}
