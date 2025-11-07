
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This file is used for server-side actions.
// We initialize the standard Firebase client SDK, which can be used in server environments
// for operations like signing up and logging in users.

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
