import type { AllocationPoint } from '@/lib/types';
import { formatPercent, formatTon } from './lib/format';

interface AllocationChartProps {
  title: string;
  points: AllocationPoint[];
  total?: number;
  variant?: 'bar' | 'donut';
  centerLabel?: string;
}

const SEGMENT_COLORS = [
  '#0098ea',
  '#3ddc84',
  '#f3b84b',
  '#a990ff',
];

export function AllocationChart({
  title,
  points,
  total,
  variant = 'bar',
  centerLabel,
}: AllocationChartProps) {
  const computedTotal = total ?? points.reduce((sum, point) => sum + Math.max(point.ton, 0), 0);
  const safeTotal = computedTotal > 0 ? computedTotal : 1;

  if (variant === 'donut') {
    let acc = 0;
    const stops = points
      .map((point, index) => {
        const value = Math.max(point.ton, 0);
        const pct = (value / safeTotal) * 100;
        if (pct <= 0) return null;
        const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
        const start = acc;
        acc += pct;
        return `${color} ${start}% ${acc}%`;
      })
      .filter(Boolean)
      .join(', ');

    const donutStops = stops || `rgba(242, 235, 215, 0.08) 0% 100%`;

    return (
      <figure className="donut">
        <figcaption className="donut__title">{title}</figcaption>
        <div
          className="donut__chart"
          role="img"
          aria-label={`${title} composition`}
          style={{ ['--donut-stops' as string]: donutStops } as React.CSSProperties}
        >
          <div className="donut__center">
            <span className="donut__center-value">{formatTon(computedTotal, 2)}</span>
            <span className="donut__center-label">{centerLabel ?? 'TON total'}</span>
          </div>
        </div>
        <ul className="donut__legend">
          {points.map((point, index) => (
            <li key={point.label}>
              <span
                className="donut__swatch"
                aria-hidden="true"
                style={{ background: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
              />
              <span className="donut__legend-label">{point.label}</span>
              <span className="donut__legend-value">
                {formatTon(point.ton, 2)} · {formatPercent(point.percentage)}
              </span>
            </li>
          ))}
        </ul>
      </figure>
    );
  }

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
                background: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
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
