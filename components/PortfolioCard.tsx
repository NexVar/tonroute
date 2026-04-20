'use client';

import type { PortfolioAnalysis } from '@/lib/types';
import { AllocationChart } from './AllocationChart';
import { formatPercent, formatRelative, formatTon, shortenAddress } from './lib/format';
import { Section } from './Section';

interface PortfolioCardProps {
  analysis: PortfolioAnalysis;
  onRefresh?: () => void;
  refreshing?: boolean;
}

function insightTone(text: string): 'info' | 'gold' | 'mint' {
  const lower = text.toLowerCase();
  if (/(idle|unused|eligible|route)/.test(lower)) return 'gold';
  if (/(earning|staked|apy|tstaked|tston)/.test(lower)) return 'mint';
  return 'info';
}

export function PortfolioCard({ analysis, onRefresh, refreshing }: PortfolioCardProps) {
  const total = analysis.balanceTon + analysis.tsTonBalance;
  const stakedShare = total > 0 ? (analysis.tsTonBalance / total) * 100 : 0;
  const idleShare = analysis.balanceTon > 0 ? (analysis.idleTon / analysis.balanceTon) * 100 : 0;

  const allocationPoints = [
    { label: 'Liquid TON', ton: analysis.balanceTon - analysis.idleTon, percentage: 0 },
    { label: 'Idle TON', ton: analysis.idleTon, percentage: 0 },
    { label: 'tsTON', ton: analysis.tsTonBalance, percentage: 0 },
  ].map((pt) => ({ ...pt, percentage: total > 0 ? (pt.ton / total) * 100 : 0 }));

  return (
    <Section
      eyebrow="Step 02"
      title="Wallet snapshot"
      description={`Address ${shortenAddress(analysis.address)} on ${analysis.network}. Synced ${formatRelative(analysis.lastUpdated)}.`}
      actions={
        onRefresh && (
          <button
            type="button"
            className="btn btn--ghost btn--icon"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh wallet snapshot"
            title="Refresh"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
              <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        )
      }
    >
      <div className="metric-grid">
        <Metric label="Total TON" value={`${formatTon(total)}`} hint={`${formatPercent(stakedShare)} already staked`} />
        <Metric
          label="Liquid TON"
          value={`${formatTon(analysis.balanceTon)}`}
          hint={analysis.balanceTon > 0 ? `${formatPercent(idleShare)} sits idle` : 'No liquid TON'}
        />
        <Metric label="Idle TON" value={`${formatTon(analysis.idleTon)}`} hint="Eligible for routing" tone="gold" />
        <Metric
          label="tsTON staked"
          value={`${formatTon(analysis.tsTonBalance)}`}
          hint={analysis.tsTonBalance > 0 ? 'Earning Tonstakers APY' : 'No staked exposure'}
          tone="accent"
        />
      </div>

      {total > 0 && (
        <AllocationChart title="Current allocation" points={allocationPoints} total={total} />
      )}

      {analysis.holdings.length > 0 && (
        <div className="holdings">
          <h3 className="holdings__title">Holdings</h3>
          <ul className="holdings__list">
            {analysis.holdings.map((holding) => (
              <li key={`${holding.symbol}-${holding.assetAddress ?? 'native'}`} className="holdings__item">
                <div className="holdings__primary">
                  <span className={`tag tag--${holding.category}`}>{holding.category.replace('-', ' ')}</span>
                  <span className="holdings__symbol">{holding.symbol}</span>
                </div>
                <div className="holdings__secondary">
                  <span>{holding.amountDisplay}</span>
                  {typeof holding.apy === 'number' && <span className="holdings__apy">{formatPercent(holding.apy)} APY</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.insights.length > 0 && (
        <div className="insights">
          <h3 className="insights__title">Insights</h3>
          <ul className="insight-chips">
            {analysis.insights.map((insight) => (
              <li key={insight} className={`insight-chip insight-chip--${insightTone(insight)}`}>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'accent' | 'gold';
}) {
  const classes = ['metric'];
  if (tone === 'accent') classes.push('metric--accent');
  if (tone === 'gold') classes.push('metric--gold');
  return (
    <div className={classes.join(' ')}>
      <span className="metric__label">{label}</span>
      <span className="metric__value">{value}</span>
      {hint && <span className="metric__hint">{hint}</span>}
    </div>
  );
}
