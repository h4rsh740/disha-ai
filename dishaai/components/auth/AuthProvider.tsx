'use client';

import React from 'react';
import { AuthProvider as FirebaseAuthProvider, useAuth } from '@/lib/firebase/auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

export { useAuth };
