import type { AllocationPoint } from '@/lib/types';
import { formatPercent, formatTon } from './lib/format';

interface AllocationChartProps {
  title: string;
  points: AllocationPoint[];
  total?: number;
}

const SEGMENT_COLORS = ['var(--allocation-liquid)', 'var(--allocation-staked)', 'var(--allocation-extra)'];

export function AllocationChart({ title, points, total }: AllocationChartProps) {
  const computedTotal = total ?? points.reduce((sum, point) => sum + Math.max(point.ton, 0), 0);
  const safeTotal = computedTotal > 0 ? computedTotal : 1;

  return (
    <figure className="allocation">
      <figcaption className="allocation__title">{title}</figcaption>
      <div className="allocation__bar" role="img" aria-label={`${title} composition`}>
        {points.map((point, index) => {
          const widthPct = (Math.max(point.ton, 0) / safeTotal) * 100;
          if (widthPct <= 0) return null;
          return (
            <span
              key={point.label}
              className="allocation__segment"
              style={{
                width: `${widthPct}%`,
                background: SEGMENT_COLORS[index % SEGMENT_COLORS.length]
              }}
              title={`${point.label}: ${formatTon(point.ton)} TON`}
            />
          );
        })}
      </div>
      <ul className="allocation__legend">
        {points.map((point, index) => (
          <li key={point.label}>
            <span
              className="allocation__swatch"
              aria-hidden="true"
              style={{ background: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
            />
            <span className="allocation__legend-label">{point.label}</span>
            <span className="allocation__legend-value">
              {formatTon(point.ton)} TON · {formatPercent(point.percentage)}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
