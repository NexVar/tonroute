'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { ReactNode } from 'react';

export function Providers({ children, manifestUrl }: { children: ReactNode; manifestUrl: string }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl} restoreConnection>
      {children}
    </TonConnectUIProvider>
  );
}
