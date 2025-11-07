
'use server'

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "@/firebase/server";
import dbConnect from "@/lib/dbConnect";
import Center from "@/models/Center";
import { z } from "zod";

const formSchema = z.object({
  center_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  district: z.string().min(2),
  address: z.string().min(5),
});

export async function registerCenter(formData: unknown) {
  const result = formSchema.safeParse(formData);

  if (!result.success) {
    const errorMessages = result.error.errors.map(e => e.message).join(', ');
    return { success: false, error: `Invalid form data: ${errorMessages}` };
  }

  const { center_name, email, password, phone, district, address } = result.data;

  try {
    // Check if center already exists
    await dbConnect();
    const existingCenter = await Center.findOne({ $or: [{ email }, { center_name }, { phone }] });
    if (existingCenter) {
      return { success: false, error: "A center with this name, email, or phone number already exists." };
    }

    const auth = getAuth(app);

    // Step 1: Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Step 2: Create center profile in MongoDB
    const newCenter = new Center({
      uid: firebaseUser.uid,
      center_name,
      email,
      phone,
      location: {
        district,
        address,
      },
      // role, verified, stock, etc., will use default values from the schema
    });

    await newCenter.save();

    return { success: true };

  } catch (error: any) {
    console.error("Center registration error:", error);

    let errorMessage = "An unexpected error occurred during registration.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already registered in Firebase.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "The password is too weak.";
    }

    return { success: false, error: errorMessage };
  }
}
