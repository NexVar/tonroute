'use client';

import type { StrategyRecommendation } from '@/lib/types';
import { AllocationChart } from './AllocationChart';
import { Section } from './Section';
import { formatPercent } from './lib/format';

interface ResultCardProps {
  recommendation: StrategyRecommendation;
  onReset: () => void;
}

export function ResultCard({ recommendation, onReset }: ResultCardProps) {
  const totalTon = recommendation.portfolioAnalysis.balanceTon + recommendation.portfolioAnalysis.tsTonBalance;

  return (
    <Section
      eyebrow="Done"
      title="Plan completed"
      description={`Your wallet is now positioned for the ${recommendation.label.toLowerCase()} strategy. Targeting ~${recommendation.expectedApy}% APY with ${formatPercent(recommendation.liquidPercentage)} liquid.`}
      actions={
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Start a new plan
        </button>
      }
      tone="subtle"
    >
      <div className="result">
        <div className="result__chart">
          <AllocationChart title="New allocation" points={recommendation.after} total={totalTon} />
        </div>
        <ul className="result__highlights">
          <li>
            <span className="result__highlight-label">Strategy</span>
            <span className="result__highlight-value">{recommendation.label}</span>
          </li>
          <li>
            <span className="result__highlight-label">Expected APY</span>
            <span className="result__highlight-value">{recommendation.expectedApy}%</span>
          </li>
          <li>
            <span className="result__highlight-label">Liquid share</span>
            <span className="result__highlight-value">{formatPercent(recommendation.liquidPercentage)}</span>
          </li>
        </ul>
      </div>
    </Section>
  );
}
