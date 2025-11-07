
// src/app/signup/actions.ts

'use server'

import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { app } from "@/firebase/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// No Zod schema needed here. The client validates format, Firebase validates content.
interface SignupFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export async function signup(formData: SignupFormData) {
  const { firstName, lastName, email, password } = formData;

  try {
    const auth = getAuth(app);

    // Step 1: Create the user in Firebase Authentication.
    // Firebase handles password hashing, email validation, and checks for existing users.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Step 2: Send the verification email using Firebase.
    const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/login`, // URL to redirect to after verification
        handleCodeInApp: true,
    };
    await sendEmailVerification(firebaseUser, actionCodeSettings);

    // Step 3: Connect to your database.
    await dbConnect();

    // Step 4: Create a corresponding user profile in your MongoDB.
    // IMPORTANT: DO NOT store the password. The firebaseUid is the link.
    const newUser = new User({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email, // Use email from the created Firebase user for consistency
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      emailVerified: false, // Will be updated later, e.g., via a webhook or custom claims
    });

    await newUser.save();

    // Prepare the user object to return to the client (without sensitive data)
    const userObject = newUser.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...userWithoutSensitiveData } = userObject;

    return { success: true, user: JSON.parse(JSON.stringify(userWithoutSensitiveData)) };

  } catch (error: any) {
    console.error("Signup error:", error.code, error.message);

    // Provide user-friendly error messages based on Firebase error codes.
    let errorMessage = "An unexpected error occurred during signup.";
    if (error.code === 'auth/email-already-in-use') {
        errorMessage = "A user with this email already exists.";
    } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please choose a stronger password.";
    }

    return { success: false, error: errorMessage };
  }
}

// The resendVerificationEmail function can remain as it is.
export async function resendVerificationEmail(email: string) {
    try {
        const auth = getAuth(app);
        // To resend a verification email, we need to be authenticated.
        // This action is more complex than it seems, because we need the user's context.
        // A simple approach is to have the user log in again to trigger a state where we can get the currentUser.
        // For this implementation, we will assume this action is called from a context where the user
        // object is available, even if not fully authenticated (e.g., just after signup).
        
        // This is a simplified example. A robust implementation might require
        // looking up the user by email if not currently signed in, which is an admin-level task.
        // However, for resending to the *currently signed-up* user, this can work.
        const user = auth.currentUser;

        if (user && user.email === email) {
            const actionCodeSettings = {
                url: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
                handleCodeInApp: true,
            };
            await sendEmailVerification(user, actionCodeSettings);
            return { success: true };
        }

        // If we can't find a current user, it's safer to guide them.
        return { success: false, error: "Could not send verification email. Please try logging in again." };

    } catch (error: any) {
        console.error("Resend verification email error:", error);
        return { success: false, error: "Could not resend verification email." };
    }
}
