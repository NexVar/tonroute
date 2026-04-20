'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import { Section } from './Section';

interface WalletGateProps {
  onUseDemoWallet?: () => void;
  demoLoading?: boolean;
}

export function WalletGate({ onUseDemoWallet, demoLoading = false }: WalletGateProps) {
  return (
    <Section
      eyebrow="Step 1"
      title="Connect your TON wallet"
      description="TonRoute reads your wallet to find idle TON and route it through STON.fi or Tonstakers based on the goal you choose. Nothing is signed until you confirm execution."
      actions={
        <div className="wallet-gate__actions">
          <TonConnectButton />
          {onUseDemoWallet && (
            <button type="button" className="btn btn--ghost" onClick={onUseDemoWallet} disabled={demoLoading}>
              {demoLoading ? 'Loading demo wallet…' : 'Use local demo wallet'}
            </button>
          )}
        </div>
      }
    >
      <ul className="checklist">
        <li>
          <span className="checklist__icon" aria-hidden="true">⊙</span>
          <div>
            <h3>Read-only analysis first</h3>
            <p>We never touch your wallet until you pick a strategy and confirm execution.</p>
          </div>
        </li>
        <li>
          <span className="checklist__icon" aria-hidden="true">↔</span>
          <div>
            <h3>One guided flow</h3>
            <p>Compare safe, balanced, and yield outcomes side by side before you commit.</p>
          </div>
        </li>
        <li>
          <span className="checklist__icon" aria-hidden="true">⚡</span>
          <div>
            <h3>Routes through proven protocols</h3>
            <p>Swap via STON.fi, stake via Tonstakers — no custody, no hidden hops.</p>
          </div>
        </li>
      </ul>
      {onUseDemoWallet && (
        <p className="wallet-gate__note">
          Local demo mode uses the repository testnet wallet on the server so browser automation can exercise the live testnet flow without an external wallet app.
        </p>
      )}
    </Section>
  );
}
