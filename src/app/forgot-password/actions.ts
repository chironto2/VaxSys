
'use server'

import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "@/firebase/server";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export async function forgotPassword(formData: unknown) {
  const result = formSchema.safeParse(formData);

  if (!result.success) {
    return { success: false, error: "Invalid email address." };
  }

  const { email } = result.data;

  try {
    const auth = getAuth(app);
    // The actionCodeSettings object can be used to configure the password reset email
    const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/login`, // Redirect to login after reset
        handleCodeInApp: true,
    };
    
    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    return { success: true };

  } catch (error: any) {
    console.error("Forgot password error:", error.code, error.message);
    
    // It's a good security practice not to reveal if an email exists in the system.
    // So, we'll return a generic success message even if the user is not found.
    if (error.code === 'auth/user-not-found') {
        return { success: true }; // Don't leak user existence
    }

    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
