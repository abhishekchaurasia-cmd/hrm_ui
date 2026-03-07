'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

import StoreProvider from '@/store/provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </StoreProvider>
    </SessionProvider>
  );
}
