
'use client';

import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import * as React from 'react';

// Define the context shape
interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

// Create the context
const FirebaseContext = React.createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  db: null,
});

// Create the provider component
export function FirebaseProvider({
  children,
  app,
  auth,
  db,
}: {
  children: React.ReactNode;
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}) {
  return (
    <FirebaseContext.Provider value={{ app, auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Create custom hooks to access the context
export function useFirebase() {
  const context = React.useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useFirestore() {
  return useFirebase().db;
}
