export default function Loading() {
  return (
    <main className="page-loading">
      <div className="page-loading__panel" role="status" aria-live="polite">
        <span className="page-loading__spinner" aria-hidden="true" />
        <p className="page-loading__title">Loading TonRoute…</p>
        <p className="page-loading__hint">Restoring wallet and pricing data.</p>
      </div>
    </main>
  );
}
