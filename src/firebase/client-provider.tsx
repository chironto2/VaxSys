
'use client';

import { app, auth, db } from './client';
import { FirebaseProvider } from './provider';

// This provider is responsible for ensuring Firebase is initialized on the client.
// It should be used as a wrapper around the main application layout.
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}
