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
  busy
}: RecommendationCardProps) {
  const { portfolioAnalysis } = recommendation;
  const totalTon = portfolioAnalysis.balanceTon + portfolioAnalysis.tsTonBalance;

  return (
    <Section
      eyebrow="Step 4"
      title={`${recommendation.label} strategy`}
      description={`Targeting ~${recommendation.expectedApy}% APY with ${recommendation.liquidPercentage}% kept liquid.`}
      actions={
        <button type="button" className="btn btn--primary" onClick={onContinue} disabled={busy}>
          {busy ? 'Preparing plan…' : 'Continue to execution'}
        </button>
      }
    >
      <div className="recommendation">
        <div className="recommendation__why">
          <h3>Why this fits</h3>
          <ul>
            {recommendation.why.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="recommendation__charts">
          <AllocationChart title="Before" points={recommendation.before} total={totalTon} />
          <span className="recommendation__arrow" aria-hidden="true">→</span>
          <AllocationChart title="After" points={recommendation.after} total={totalTon} />
        </div>

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
                  {formatPercent(alt.liquidPercentage)} liquid · switch to compare
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
