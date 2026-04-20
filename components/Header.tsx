'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TonConnectButton } from '@tonconnect/ui-react';

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="TonRoute home">
          <span className="brand__mark" aria-hidden="true">
            <Image
              src="/tonroute-logo.png"
              alt=""
              width={112}
              height={112}
              priority
              className="brand__logo"
            />
          </span>
          <span className="brand__text">
            <span className="brand__name">TonRoute</span>
            <span className="brand__tag">Idle TON · Routed</span>
          </span>
        </Link>
        <div className="site-header__actions">
          <span className="site-header__badge" aria-live="polite">
            Testnet live
          </span>
          <TonConnectButton />
        </div>
      </div>
    </header>
  );
}
