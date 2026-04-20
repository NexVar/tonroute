'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-error">
      <div className="page-error__panel" role="alert">
        <p className="page-error__eyebrow">Something broke</p>
        <h1 className="page-error__title">TonRoute hit an unexpected error.</h1>
        <p className="page-error__message">{error.message || 'Please try again.'}</p>
        {error.digest && <p className="page-error__digest">Reference: {error.digest}</p>}
        <button type="button" className="btn btn--primary" onClick={reset}>
          Reload screen
        </button>
      </div>
    </main>
  );
}
