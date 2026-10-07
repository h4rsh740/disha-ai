'use client';

import { useSyncExternalStore } from 'react';
import { Toaster } from 'react-hot-toast';

const emptySubscribe = () => () => {};

export function ClientToaster() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isMounted) return null;

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#15110e',
          color: '#f6efe5',
          border: '1px solid rgba(246,239,229,.14)',
          borderRadius: '6px',
          fontSize: '14px',
        },
      }}
    />
  );
}
