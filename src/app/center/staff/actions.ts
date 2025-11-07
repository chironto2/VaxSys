
'use server';

import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import Staff from '@/models/Staff';
import { revalidatePath } from 'next/cache';

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['Nurse', 'Administrator', 'Support Staff']),
  contact: z.string().min(10, 'A valid contact number is required'),
  centerId: z.string().min(1, 'Center ID is missing'),
});

const updateStaffSchema = staffSchema.extend({
  id: z.string().min(1, 'Staff ID is missing'),
});

// Action to create a new staff member
export async function addStaff(formData: unknown) {
  const result = staffSchema.safeParse(formData);
  if (!result.success) {
    const errorMessages = result.error.errors.map(e => e.message).join(', ');
    return { success: false, error: `Invalid data provided: ${errorMessages}` };
  }

  try {
    await dbConnect();
    const newStaff = new Staff(result.data);
    await newStaff.save();
    
    revalidatePath('/center/staff');
    return { success: true };
  } catch (error) {
    console.error('Error adding staff:', error);
    return { success: false, error: 'Failed to add new staff member.' };
  }
}

// Action to get all staff for a center
export async function getStaff(centerId: string) {
  if (!centerId) {
    return { success: false, error: 'Center ID is required.' };
  }
  try {
    await dbConnect();
    const staff = await Staff.find({ centerId }).lean();
    return { success: true, staff: JSON.parse(JSON.stringify(staff)) };
  } catch (error) {
    console.error('Error fetching staff:', error);
    return { success: false, error: 'Failed to fetch staff.' };
  }
}

// Action to update a staff member
export async function updateStaff(formData: unknown) {
  const result = updateStaffSchema.safeParse(formData);
  if (!result.success) {
    const errorMessages = result.error.errors.map(e => e.message).join(', ');
    return { success: false, error: `Invalid data for update: ${errorMessages}` };
  }

  const { id, ...updateData } = result.data;
  
  try {
    await dbConnect();
    const updated = await Staff.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
        return { success: false, error: 'Staff member not found.' };
    }
    
    revalidatePath('/center/staff');
    return { success: true };
  } catch (error) {
    console.error('Error updating staff:', error);
    return { success: false, error: 'Failed to update staff member.' };
  }
}

// Action to delete a staff member
export async function deleteStaff(staffId: string) {
  if (!staffId) {
    return { success: false, error: 'Staff ID is required.' };
  }

  try {
    await dbConnect();
    const deleted = await Staff.findByIdAndDelete(staffId);
    if (!deleted) {
        return { success: false, error: 'Staff member not found.' };
    }
    
    revalidatePath('/center/staff');
    return { success: true };
  } catch (error) {
    console.error('Error deleting staff:', error);
    return { success: false, error: 'Failed to delete staff member.' };
  }
}
