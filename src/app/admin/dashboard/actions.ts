
'use server';

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Center from '@/models/Center';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { revalidatePath } from 'next/cache';

// Helper to initialize Firebase Admin SDK
async function initializeFirebaseAdmin() {
    if (admin.apps.length === 0) {
        if (process.env.FIREBASE_ADMIN_KEY) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            } catch (e) {
                console.error('FIREBASE_ADMIN_KEY is not valid JSON.', e);
            }
        } else {
            admin.initializeApp();
        }
    }
    return admin.auth();
}

// Action to get all users
export async function getUsers() {
  try {
    await dbConnect();
    const users = await User.find({}).select('firebaseUid firstName lastName email role').lean();
    return { success: true, users: JSON.parse(JSON.stringify(users)) };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users.' };
  }
}

// Action to get all centers
export async function getCenters() {
  try {
    await dbConnect();
    const centers = await Center.find({}).select('center_name email location verified').lean();
    return { success: true, centers: JSON.parse(JSON.stringify(centers)) };
  } catch (error) {
    console.error('Error fetching centers:', error);
    return { success: false, error: 'Failed to fetch centers.' };
  }
}

// Schema for updating a user's role
const updateUserRoleSchema = z.object({
  targetUserId: z.string(),
  newRole: z.enum(['citizen', 'authority', 'center']),
  adminFirebaseUid: z.string(),
});

// Action to update a user's role
export async function updateUserRole(data: unknown) {
  const validationResult = updateUserRoleSchema.safeParse(data);
  if (!validationResult.success) {
    return { success: false, error: 'Invalid input data.' };
  }

  const { targetUserId, newRole, adminFirebaseUid } = validationResult.data;

  try {
    await dbConnect();

    const adminUser = await User.findOne({ firebaseUid: adminFirebaseUid });
    if (!adminUser || adminUser.role !== 'authority') {
      return { success: false, error: 'Permission denied. Not an administrator.' };
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return { success: false, error: 'Target user not found.' };
    }
    
    if (adminUser.firebaseUid === targetUser.firebaseUid) {
        return { success: false, error: "Administrators cannot change their own role." };
    }

    targetUser.role = newRole;
    await targetUser.save();
    
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'An internal error occurred while updating the role.' };
  }
}

// Schema for verifying a center
const verifyCenterSchema = z.object({
  centerId: z.string(),
  adminFirebaseUid: z.string(),
});

// Action to verify a center
export async function verifyCenter(data: unknown) {
    const validationResult = verifyCenterSchema.safeParse(data);
    if (!validationResult.success) {
        return { success: false, error: 'Invalid input data.' };
    }

    const { centerId, adminFirebaseUid } = validationResult.data;
     try {
        await dbConnect();

        const adminUser = await User.findOne({ firebaseUid: adminFirebaseUid });
        if (!adminUser || adminUser.role !== 'authority') {
            return { success: false, error: 'Permission denied. Not an administrator.' };
        }

        const center = await Center.findByIdAndUpdate(centerId, { verified: true }, { new: true });
        if (!center) {
            return { success: false, error: 'Center not found.' };
        }
        
        revalidatePath('/admin/dashboard');
        return { success: true };

    } catch (error) {
        console.error('Error verifying center:', error);
        return { success: false, error: 'An internal error occurred while verifying the center.' };
    }
}

// Schema for rejecting a center
const rejectCenterSchema = z.object({
  centerId: z.string(),
  adminFirebaseUid: z.string(),
});

// Action to reject and delete a center registration
export async function rejectCenter(data: unknown) {
    const validationResult = rejectCenterSchema.safeParse(data);
    if (!validationResult.success) {
        return { success: false, error: 'Invalid input data.' };
    }

    const { centerId, adminFirebaseUid } = validationResult.data;
     try {
        await dbConnect();

        const adminUser = await User.findOne({ firebaseUid: adminFirebaseUid });
        if (!adminUser || adminUser.role !== 'authority') {
            return { success: false, error: 'Permission denied. Not an administrator.' };
        }

        const center = await Center.findById(centerId);
        if (!center) {
            return { success: false, error: 'Center not found.' };
        }

        // Delete the user from Firebase Authentication
        const auth = await initializeFirebaseAdmin();
        try {
            if (center.uid) {
                await auth.deleteUser(center.uid);
            }
        } catch (authError: any) {
            console.warn(`Could not delete Firebase Auth user ${center.uid}:`, authError.message);
        }

        // Delete the center from MongoDB
        await Center.findByIdAndDelete(centerId);
        
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error rejecting center:', error);
        return { success: false, error: 'An internal error occurred while rejecting the center.' };
    }
}
