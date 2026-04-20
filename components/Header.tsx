'use client';

import Link from 'next/link';
import { TonConnectButton } from '@tonconnect/ui-react';

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="TonRoute home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M4 7l8-4 8 4v10l-8 4-8-4V7z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M12 7l4 2v6l-4 2-4-2V9l4-2z" fill="currentColor" opacity="0.85" />
            </svg>
          </span>
          <span className="brand__text">
            <span className="brand__name">TonRoute</span>
            <span className="brand__tag">Strategy router for idle TON</span>
          </span>
        </Link>
        <div className="site-header__actions">
          <TonConnectButton />
        </div>
      </div>
    </header>
  );
}
