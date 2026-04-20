'use client';

import { TonConnectButton } from '@tonconnect/ui-react';

interface HeroProps {
  showConnect: boolean;
  demoBadge?: string | null;
}

export function Hero({ showConnect, demoBadge }: HeroProps) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__text">
        <p className="hero__eyebrow">Strategy router for TON</p>
        <h1 className="hero__title" id="hero-title">
          Put your idle <span className="hero__title-mark">TON</span>
          <br />
          to work <em>— without guessing.</em>
        </h1>
        <p className="hero__subtitle">
          Read your wallet, pick the goal that fits, and route liquidity across STON.fi and Tonstakers with a
          one-click plan. Nothing moves until you sign.
        </p>
        {showConnect && (
          <div className="hero__cta">
            <TonConnectButton />
            <span className="hero__cta-note">Read-only · Testnet</span>
          </div>
        )}
        {demoBadge && <p className="hero__badge">Demo wallet · {demoBadge}</p>}
        <HeroStats />
      </div>

      <HeroVisual />
    </section>
  );
}

function HeroStats() {
  return (
    <div className="stat-rail" aria-label="Live protocol stats">
      <span className="stat-rail__pulse">Live</span>
      <div className="stat">
        <span className="stat__label">Tonstakers APY</span>
        <span className="stat__value">5.4%</span>
        <span className="stat__hint">+0.1 · 24h</span>
      </div>
      <div className="stat">
        <span className="stat__label">STON.fi Routes</span>
        <span className="stat__value">2.1M</span>
        <span className="stat__hint">TVL routed</span>
      </div>
      <div className="stat">
        <span className="stat__label">Idle TON found</span>
        <span className="stat__value">38%</span>
        <span className="stat__hint">avg per wallet</span>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="hero__visual" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="hero__svg">
        <defs>
          <radialGradient id="nodeFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0, 152, 234, 0.4)" />
            <stop offset="100%" stopColor="rgba(0, 152, 234, 0)" />
          </radialGradient>
          <radialGradient id="nodeFillGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(243, 184, 75, 0.4)" />
            <stop offset="100%" stopColor="rgba(243, 184, 75, 0)" />
          </radialGradient>
          <radialGradient id="nodeFillMint" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(61, 220, 132, 0.4)" />
            <stop offset="100%" stopColor="rgba(61, 220, 132, 0)" />
          </radialGradient>
        </defs>

        {/* Backdrop grid lines */}
        <g opacity="0.12">
          <line x1="0" y1="200" x2="400" y2="200" stroke="currentColor" strokeWidth="0.5" />
          <line x1="200" y1="0" x2="200" y2="400" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="170" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 4" />
          <circle cx="200" cy="200" r="110" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 4" />
        </g>

        {/* Route lines */}
        <path
          d="M 80 120 Q 200 60 320 120 T 320 280 T 80 280 T 80 120"
          className="route-line route-line--ton"
        />
        <path
          d="M 80 280 Q 200 360 320 280"
          className="route-line route-line--gold"
        />
        <path
          d="M 80 120 Q 200 200 320 280"
          className="route-line route-line--mint"
        />

        {/* Wallet node (source) */}
        <g transform="translate(80 200)">
          <circle cx="0" cy="0" r="40" fill="url(#nodeFill)" />
          <circle cx="0" cy="0" r="22" className="route-node" stroke="var(--ton)" />
          <circle cx="0" cy="0" r="30" className="route-node__ring" stroke="var(--ton)" strokeWidth="0.8" />
          <text x="0" y="4" textAnchor="middle" fontSize="10" fill="var(--ton)" fontFamily="var(--font-mono-stack)" fontWeight="600">
            WALLET
          </text>
          <text x="0" y="52" textAnchor="middle" className="route-node__label">
            source
          </text>
        </g>

        {/* STON.fi node */}
        <g transform="translate(320 120)">
          <circle cx="0" cy="0" r="40" fill="url(#nodeFillGold)" />
          <circle cx="0" cy="0" r="22" className="route-node" stroke="var(--gold)" />
          <circle cx="0" cy="0" r="30" className="route-node__ring" stroke="var(--gold)" strokeWidth="0.8" />
          <text x="0" y="4" textAnchor="middle" fontSize="10" fill="var(--gold)" fontFamily="var(--font-mono-stack)" fontWeight="600">
            STON
          </text>
          <text x="0" y="52" textAnchor="middle" className="route-node__label">
            swap
          </text>
        </g>

        {/* Tonstakers node */}
        <g transform="translate(320 280)">
          <circle cx="0" cy="0" r="40" fill="url(#nodeFillMint)" />
          <circle cx="0" cy="0" r="22" className="route-node" stroke="var(--mint)" />
          <circle cx="0" cy="0" r="30" className="route-node__ring" stroke="var(--mint)" strokeWidth="0.8" />
          <text x="0" y="4" textAnchor="middle" fontSize="9" fill="var(--mint)" fontFamily="var(--font-mono-stack)" fontWeight="600">
            tsTON
          </text>
          <text x="0" y="52" textAnchor="middle" className="route-node__label">
            stake
          </text>
        </g>

        {/* Ticker labels */}
        <text x="200" y="78" textAnchor="middle" className="route-ticker">
          ROUTE · 01
        </text>
        <text x="200" y="310" textAnchor="middle" className="route-ticker">
          ROUTE · 02
        </text>
      </svg>
    </div>
  );
}
