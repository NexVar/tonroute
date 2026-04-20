'use client';

import type { StrategyGoal, StrategyRecommendation } from '@/lib/types';
import { AllocationChart } from './AllocationChart';
import { Section } from './Section';
import { formatPercent } from './lib/format';

interface RecommendationCardProps {
  recommendation: StrategyRecommendation;
  onSelectAlternative: (goal: StrategyGoal) => void;
  onContinue: () => void;
  busy?: boolean;
}

export function RecommendationCard({
  recommendation,
  onSelectAlternative,
  onContinue,
  busy,
}: RecommendationCardProps) {
  const { portfolioAnalysis } = recommendation;
  const totalTon = portfolioAnalysis.balanceTon + portfolioAnalysis.tsTonBalance;

  const stakedPct = recommendation.after.reduce((sum, point) => {
    if (/ts?ton|stake/i.test(point.label)) return sum + point.percentage;
    return sum;
  }, 0);

  const unlockEstimate = recommendation.liquidPercentage >= 60 ? 'Instant' : recommendation.liquidPercentage >= 30 ? '~12h avg' : '~48h avg';

  return (
    <Section
      eyebrow="Step 04"
      title={
        <>
          {recommendation.label} <em>strategy</em>
        </>
      }
      description={`Targeting ~${recommendation.expectedApy}% APY with ${recommendation.liquidPercentage}% kept liquid.`}
      actions={
        <button type="button" className="btn btn--primary" onClick={onContinue} disabled={busy}>
          {busy ? 'Preparing plan…' : 'Continue to execution →'}
        </button>
      }
    >
      <div className="recommendation">
        <div className="recommendation__main">
          <ul className="recommendation__chips">
            <li className="recommendation__chip">
              <span className="recommendation__chip-label">Target APY</span>
              <span className="recommendation__chip-value">{recommendation.expectedApy}%</span>
              <span className="recommendation__chip-hint">net, post-fees</span>
            </li>
            <li className="recommendation__chip">
              <span className="recommendation__chip-label">Liquid share</span>
              <span className="recommendation__chip-value">{formatPercent(recommendation.liquidPercentage)}</span>
              <span className="recommendation__chip-hint">remains in wallet</span>
            </li>
            <li className="recommendation__chip">
              <span className="recommendation__chip-label">Staked share</span>
              <span className="recommendation__chip-value">{formatPercent(stakedPct)}</span>
              <span className="recommendation__chip-hint">earning on Tonstakers</span>
            </li>
            <li className="recommendation__chip">
              <span className="recommendation__chip-label">Unlock</span>
              <span className="recommendation__chip-value">{unlockEstimate}</span>
              <span className="recommendation__chip-hint">when you want out</span>
            </li>
          </ul>

          <div className="recommendation__charts">
            <AllocationChart
              title="Before"
              points={recommendation.before}
              total={totalTon}
              variant="donut"
              centerLabel="Now"
            />
            <span className="recommendation__arrow" aria-hidden="true">→</span>
            <AllocationChart
              title="After"
              points={recommendation.after}
              total={totalTon}
              variant="donut"
              centerLabel="Routed"
            />
          </div>

          <div className="recommendation__why">
            <h3>Why this fits</h3>
            <ul className="insight-chips">
              {recommendation.why.map((reason, index) => (
                <li
                  key={reason}
                  className={`insight-chip insight-chip--${index % 3 === 0 ? 'info' : index % 3 === 1 ? 'mint' : 'gold'}`}
                >
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="recommendation__aside">
          <div className="recommendation__alts">
            <h3>Compare alternatives</h3>
            <div className="alt-grid">
              {recommendation.alternatives.map((alt) => (
                <button
                  key={alt.goal}
                  type="button"
                  onClick={() => onSelectAlternative(alt.goal)}
                  disabled={busy}
                  className="alt-card"
                >
                  <div className="alt-card__head">
                    <span className="alt-card__label">{alt.label}</span>
                    <span className="alt-card__apy">~{alt.expectedApy}%</span>
                  </div>
                  <p className="alt-card__summary">{alt.summary}</p>
                  <span className="alt-card__meta">
                    {formatPercent(alt.liquidPercentage)} liquid · tap to switch
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Section>
  );
}
