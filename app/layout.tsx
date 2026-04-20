import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const manifestUrl = `${appUrl.replace(/\/$/, '')}/tonconnect-manifest.json`;

export const metadata: Metadata = {
  title: 'TonRoute — put idle TON to work',
  description:
    'TonRoute analyzes your TON wallet, recommends a strategy, and routes execution through STON.fi and Tonstakers in one guided flow.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers manifestUrl={manifestUrl}>{children}</Providers>
      </body>
    </html>
  );
}
