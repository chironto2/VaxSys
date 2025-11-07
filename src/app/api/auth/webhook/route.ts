
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// This is a simplified webhook. In a production environment, you should
// secure this endpoint, for example by verifying a secret token from Firebase.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, data } = body;

    // We are only interested in the email verification event from Firebase Auth
    if (eventType === 'com.google.firebase.auth.user.email.verified') {
        const { uid, email, metadata } = data;

        if(!uid) {
             return NextResponse.json({ success: false, message: 'No UID provided.' }, { status: 400 });
        }

        await dbConnect();
        
        const user = await User.findOne({ firebaseUid: uid });

        if (user) {
            user.emailVerified = true;
            // You could also log the verification time if needed
            // user.profile.emailVerificationTimestamp = new Date(metadata.lastSignInTime);
            await user.save();

            console.log(`Successfully verified email for user: ${email}`);
            return NextResponse.json({ success: true, message: `Verified email for ${email}` });
        } else {
             return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }
    }

    // Return a success response for other events to acknowledge receipt
    return NextResponse.json({ success: true, message: 'Event received' });

  } catch (error) {
    console.error('Firebase Auth webhook error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
