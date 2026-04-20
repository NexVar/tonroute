'use client';

import type { PortfolioAnalysis } from '@/lib/types';
import { formatPercent, formatRelative, formatTon, shortenAddress } from './lib/format';
import { Section } from './Section';

interface PortfolioCardProps {
  analysis: PortfolioAnalysis;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function PortfolioCard({ analysis, onRefresh, refreshing }: PortfolioCardProps) {
  const total = analysis.balanceTon + analysis.tsTonBalance;
  const stakedShare = total > 0 ? (analysis.tsTonBalance / total) * 100 : 0;
  const idleShare = analysis.balanceTon > 0 ? (analysis.idleTon / analysis.balanceTon) * 100 : 0;

  return (
    <Section
      eyebrow="Step 2"
      title="Wallet snapshot"
      description={`Address ${shortenAddress(analysis.address)} on ${analysis.network}. Synced ${formatRelative(analysis.lastUpdated)}.`}
      actions={
        onRefresh && (
          <button type="button" className="btn btn--ghost" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        )
      }
    >
      <div className="metric-grid">
        <Metric label="Total TON" value={`${formatTon(total)} TON`} hint={`${formatPercent(stakedShare)} already staked`} />
        <Metric
          label="Liquid TON"
          value={`${formatTon(analysis.balanceTon)} TON`}
          hint={analysis.balanceTon > 0 ? `${formatPercent(idleShare)} of liquid sits idle` : 'Wallet has no liquid TON'}
        />
        <Metric label="Idle TON" value={`${formatTon(analysis.idleTon)} TON`} hint="Eligible for routing" tone="accent" />
        <Metric
          label="tsTON staked"
          value={`${formatTon(analysis.tsTonBalance)} TON`}
          hint={analysis.tsTonBalance > 0 ? 'Earning Tonstakers APY' : 'No staked exposure yet'}
        />
      </div>

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
          <ul>
            {analysis.insights.map((insight) => (
              <li key={insight}>{insight}</li>
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
  tone
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'accent';
}) {
  return (
    <div className={`metric ${tone === 'accent' ? 'metric--accent' : ''}`}>
      <span className="metric__label">{label}</span>
      <span className="metric__value">{value}</span>
      {hint && <span className="metric__hint">{hint}</span>}
    </div>
  );
}
