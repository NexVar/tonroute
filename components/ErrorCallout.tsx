interface ErrorCalloutProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  severity?: 'error' | 'warn';
}

export function ErrorCallout({
  title = 'Something went wrong',
  message,
  details,
  onRetry,
  severity = 'error',
}: ErrorCalloutProps) {
  return (
    <div role="alert" className={`callout callout--${severity}`}>
      <div className="callout__body">
        <h3 className="callout__title">{title}</h3>
        <p className="callout__message">{message}</p>
        {details && <pre className="callout__details">{details}</pre>}
      </div>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
