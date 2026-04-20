'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import { Section } from './Section';

interface WalletGateProps {
  onUseDemoWallet?: () => void;
  demoLoading?: boolean;
}

export function WalletGate({ onUseDemoWallet, demoLoading = false }: WalletGateProps) {
  return (
    <Section eyebrow="Step 01" title="Connect your wallet, then everything else.">
      <div className="wallet-gate__hero">
        <div className="wallet-gate__lede">
          <h2>
            We read your wallet <em>first</em>, sign nothing, and only route when you say go.
          </h2>
          <p>
            TonRoute analyses your balances across native TON, tsTON and jettons — then drafts a plan that respects the
            goal you pick. Every on-chain step is previewed before it&rsquo;s signed.
          </p>
        </div>

        <div className="wallet-gate__actions">
          <p className="wallet-gate__cta-label">Start here</p>
          <TonConnectButton />
          {onUseDemoWallet && (
            <button
              type="button"
              className="wallet-gate__demo"
              onClick={onUseDemoWallet}
              disabled={demoLoading}
            >
              {demoLoading ? 'Spinning up demo wallet…' : 'Or try the local demo wallet'}
              <span className="wallet-gate__demo-arrow" aria-hidden="true">
                →
              </span>
            </button>
          )}
        </div>
      </div>

      <ul className="trust-list">
        <li>
          <span className="trust-list__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <div>
            <h3>Read-only by default</h3>
            <p>Your balance is inspected client-side. Nothing is broadcast until you review and sign.</p>
          </div>
        </li>
        <li>
          <span className="trust-list__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7l8 5 8-5" />
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M3 12h6" />
              <path d="M15 12h6" />
            </svg>
          </span>
          <div>
            <h3>One guided flow</h3>
            <p>Compare safe, balanced and yield outcomes side-by-side with a live allocation preview.</p>
          </div>
        </li>
        <li>
          <span className="trust-list__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
            </svg>
          </span>
          <div>
            <h3>Routes through proven protocols</h3>
            <p>Swap via STON.fi. Stake via Tonstakers. No custody, no hidden hops.</p>
          </div>
        </li>
      </ul>

      {onUseDemoWallet && (
        <p className="wallet-gate__note">
          Demo mode uses the repository testnet wallet so browser automation can exercise the live testnet flow without an
          external wallet app.
        </p>
      )}
    </Section>
  );
}
