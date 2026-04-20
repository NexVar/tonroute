import type { Metadata } from 'next';
import { Fraunces, Manrope, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const manifestUrl = `${appUrl.replace(/\/$/, '')}/api/tonconnect-manifest`;

export const metadata: Metadata = {
  title: 'TonRoute — put idle TON to work',
  description:
    'TonRoute analyzes your TON wallet, recommends a strategy, and routes execution through STON.fi and Tonstakers in one guided flow.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <div className="app-grain" aria-hidden="true" />
        <Providers manifestUrl={manifestUrl}>{children}</Providers>
      </body>
    </html>
  );
}
