
'use server'

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/firebase/server"; // Use server-initialized app
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(formData: unknown) {
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: "Invalid form data." };
  }
  
  const { email, password } = result.data;

  try {
    const auth = getAuth(app);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await dbConnect();
    const user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
        // This case should ideally not happen if signup is correctly implemented
        return { success: false, error: "User profile not found in database." };
    }
    
    const isEmailVerified = firebaseUser.emailVerified;

    if (!isEmailVerified) {
        return { success: false, error: "Email not verified.", emailNotVerified: true };
    }
    
    // The user object sent to the client should not contain sensitive information.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user.toObject();

    return { success: true, user: JSON.parse(JSON.stringify(userWithoutPassword)) };

  } catch (error: any) {
    console.error("Login error:", error.code, error.message);
    let errorMessage = "Invalid credentials. Please try again.";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials. Please try again.";
    } else {
        errorMessage = "An unexpected error occurred during login.";
    }
    return { success: false, error: errorMessage };
  }
}
