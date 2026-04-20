'use client';

import clsx from 'clsx';
import type { StrategyGoal } from '@/lib/types';
import { Section } from './Section';

interface GoalOption {
  goal: StrategyGoal;
  label: string;
  tagline: string;
  expectedApy: number;
  liquidPercentage: number;
  recommended?: boolean;
  unlockHours: string;
  risk: string;
}

const OPTIONS: GoalOption[] = [
  {
    goal: 'safe',
    label: 'Safe',
    tagline: 'Keep most TON liquid. Stake a small slice to earn base yield.',
    expectedApy: 3.8,
    liquidPercentage: 70,
    unlockHours: 'Instant',
    risk: 'Low',
  },
  {
    goal: 'balanced',
    label: 'Balanced',
    tagline: 'Even split between liquid TON and staked tsTON.',
    expectedApy: 4.7,
    liquidPercentage: 40,
    recommended: true,
    unlockHours: '~12h avg',
    risk: 'Moderate',
  },
  {
    goal: 'yield',
    label: 'Yield',
    tagline: 'Maximise staking — thin liquid buffer, full tsTON lean.',
    expectedApy: 5.4,
    liquidPercentage: 15,
    unlockHours: '~48h avg',
    risk: 'Growth',
  },
];

interface GoalSelectorProps {
  selected?: StrategyGoal | null;
  loading?: boolean;
  disabled?: boolean;
  onSelect: (goal: StrategyGoal) => void;
}

export function GoalSelector({ selected, loading, disabled, onSelect }: GoalSelectorProps) {
  return (
    <Section
      eyebrow="Step 03"
      title={
        <>
          Pick your <em>goal</em>.
        </>
      }
      description="Each option targets a different blend of liquidity, yield, and risk. Switch at any time — the recommendation updates instantly."
    >
      <div className="goal-grid" role="radiogroup" aria-label="Strategy goal">
        {OPTIONS.map((option) => {
          const isSelected = option.goal === selected;
          return (
            <div key={option.goal} className="goal-card-wrap">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => onSelect(option.goal)}
                className={clsx(
                  'goal-card',
                  isSelected && 'goal-card--selected',
                  option.recommended && 'goal-card--recommended',
                  loading && isSelected && 'goal-card--loading',
                )}
              >
              <div className="goal-card__header">
                <span className="goal-card__label">{option.label}</span>
                <span className="goal-card__apy">{option.expectedApy.toFixed(1)}%</span>
              </div>
              <p className="goal-card__tagline">{option.tagline}</p>
              <div className="goal-card__meta">
                <div className="goal-card__meta-row">
                  <span className="goal-card__meta-label">Liquid</span>
                  <span className="goal-card__meta-value">{option.liquidPercentage}%</span>
                </div>
                <div className="goal-card__meta-row">
                  <span className="goal-card__meta-label">Staked</span>
                  <span className="goal-card__meta-value">{100 - option.liquidPercentage}%</span>
                </div>
                <div className="goal-card__meta-row">
                  <span className="goal-card__meta-label">Unlock</span>
                  <span className="goal-card__meta-value">{option.unlockHours}</span>
                </div>
                <div className="goal-card__meta-row">
                  <span className="goal-card__meta-label">Risk</span>
                  <span className="goal-card__meta-value">{option.risk}</span>
                </div>
              </div>
              {loading && isSelected && <span className="goal-card__spinner" aria-hidden="true" />}
              </button>
              {option.recommended && <span className="goal-card__badge">Recommended</span>}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
