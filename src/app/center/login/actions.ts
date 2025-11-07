
'use server'

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/firebase/server";
import dbConnect from "@/lib/dbConnect";
import Center from "@/models/Center";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function loginCenter(formData: unknown) {
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
    const center = await Center.findOne({ uid: firebaseUser.uid });

    if (!center) {
      return { success: false, error: "No center found for this account." };
    }

    if (!center.verified) {
      return { success: false, error: "This center has not been verified by an administrator yet." };
    }
    
    // The center object sent to the client should not contain sensitive information.
    const centerData = {
        _id: center._id.toString(),
        uid: center.uid,
        center_name: center.center_name,
        email: center.email,
        role: center.role,
    };

    return { success: true, center: JSON.parse(JSON.stringify(centerData)) };

  } catch (error: any) {
    console.error("Center login error:", error.code, error.message);
    let errorMessage = "Invalid credentials. Please try again.";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials. Please try again.";
    } else {
        errorMessage = "An unexpected error occurred during login.";
    }
    return { success: false, error: errorMessage };
  }
}
