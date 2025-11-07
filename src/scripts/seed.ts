
import dotenv from 'dotenv';
// Load environment variables from .env file BEFORE any other imports
dotenv.config({ path: '.env' });

import dbConnect from '../src/lib/dbConnect';
import User from '../src/models/User';
import mongoose from 'mongoose';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

async function seedDatabase() {
    await dbConnect();
    console.log('Connected to database');

    const adminEmail = 'najirsahin4545@gmail.com';
    const adminData = {
        firstName: 'Nazir',
        lastName: 'Sahin',
        email: adminEmail,
        role: 'authority',
        emailVerified: true,
    };

    try {
        // Initialize Firebase Admin SDK if not already initialized
        if (admin.apps.length === 0) {
            // In a managed environment like Firebase Studio, credentials are often pre-configured.
            // If process.env.FIREBASE_CONFIG is available, we can use it.
            if (process.env.FIREBASE_CONFIG) {
                 admin.initializeApp();
            } else if (process.env.FIREBASE_ADMIN_KEY) {
                // Fallback for local development if a service account key is in .env
                 admin.initializeApp({
                    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY)),
                });
            } else {
               // Fallback for local development using Application Default Credentials
               // Run `gcloud auth application-default login` in your terminal
               admin.initializeApp();
               console.log("Initialized Firebase Admin with Application Default Credentials.");
            }
        }
        
        const auth = getAuth();
        let firebaseUser: UserRecord | null = null;

        try {
            firebaseUser = await auth.getUserByEmail(adminEmail);
            console.log('Admin user found in Firebase Auth.');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log('Admin user not found in Firebase Auth. Creating...');
                firebaseUser = await auth.createUser({
                    email: adminEmail,
                    emailVerified: true,
                    password: 'defaultPassword123', // IMPORTANT: Change this password
                    displayName: `${adminData.firstName} ${adminData.lastName}`,
                });
                console.log('New Firebase Auth user created.');
            } else {
                throw error; // Re-throw other auth errors
            }
        }
        
        // Now, find or create the user in MongoDB
        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log('Admin user found in MongoDB. Updating role and Firebase UID...');
            user.role = 'authority';
            user.firebaseUid = firebaseUser.uid; // Ensure UID is linked
            await user.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Admin user not found in MongoDB. Creating a new entry...');
            user = new User({
                ...adminData,
                firebaseUid: firebaseUser.uid,
                displayName: `${adminData.firstName} ${adminData.lastName}`,
            });
            await user.save();
            console.log('Admin user created successfully in MongoDB.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

seedDatabase();
