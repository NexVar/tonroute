interface SkeletonPanelProps {
  label?: string;
  rows?: number;
}

export function SkeletonPanel({ label = 'Loading…', rows = 3 }: SkeletonPanelProps) {
  return (
    <div className="panel panel--skeleton" aria-busy="true" aria-live="polite">
      <p className="skeleton__label">{label}</p>
      <div className="skeleton__bars">
        {Array.from({ length: rows }).map((_, idx) => (
          <span key={idx} className="skeleton__bar" style={{ width: `${65 + ((idx * 11) % 30)}%` }} />
        ))}
      </div>
    </div>
  );
}
