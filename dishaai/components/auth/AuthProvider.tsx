'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    // If Clerk key is not provided yet, render cleanly in demo/local mode
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
