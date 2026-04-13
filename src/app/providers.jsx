'use client';

import { AuthProvider } from '@/lib/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/shared/ThemeToggle';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
