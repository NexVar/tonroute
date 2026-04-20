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

  const shareText = `Just routed my idle TON through TonRoute on the ${recommendation.label.toLowerCase()} strategy — ~${recommendation.expectedApy}% APY with ${recommendation.liquidPercentage}% kept liquid.`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tonroute.app';
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <Section
      eyebrow="Done"
      title={
        <>
          Plan <em>routed</em>.
        </>
      }
      description={`Your wallet is now positioned for the ${recommendation.label.toLowerCase()} strategy. Targeting ~${recommendation.expectedApy}% APY with ${formatPercent(recommendation.liquidPercentage)} liquid.`}
      actions={
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Start a new plan
        </button>
      }
      tone="subtle"
    >
      <div className="result">
        <span className="result__shine" aria-hidden="true" />
        <div className="result__chart">
          <AllocationChart
            title="New allocation"
            points={recommendation.after}
            total={totalTon}
            variant="donut"
            centerLabel="Routed"
          />
        </div>
        <div>
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

          <div className="result__share">
            <span className="result__share-label">Share</span>
            <a
              href={telegramHref}
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost"
              aria-label="Share on Telegram"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
              Telegram
            </a>
            <a
              href={xHref}
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost"
              aria-label="Share on X"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post on X
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
