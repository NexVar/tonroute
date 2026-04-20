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
}

const OPTIONS: GoalOption[] = [
  { goal: 'safe', label: 'Safe', tagline: 'Keep most TON liquid, stake a slice.', expectedApy: 3.8, liquidPercentage: 70 },
  { goal: 'balanced', label: 'Balanced', tagline: 'Even split between liquid and yield.', expectedApy: 4.7, liquidPercentage: 40 },
  { goal: 'yield', label: 'Yield', tagline: 'Maximize staking, keep a thin buffer.', expectedApy: 5.4, liquidPercentage: 15 }
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
      eyebrow="Step 3"
      title="Choose your goal"
      description="Each option targets a different blend of liquidity, yield, and risk. You can always switch — the recommendation updates instantly."
    >
      <div className="goal-grid" role="radiogroup" aria-label="Strategy goal">
        {OPTIONS.map((option) => {
          const isSelected = option.goal === selected;
          return (
            <button
              key={option.goal}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelect(option.goal)}
              className={clsx('goal-card', isSelected && 'goal-card--selected', loading && isSelected && 'goal-card--loading')}
            >
              <div className="goal-card__header">
                <span className="goal-card__label">{option.label}</span>
                <span className="goal-card__apy">~{option.expectedApy}%</span>
              </div>
              <p className="goal-card__tagline">{option.tagline}</p>
              <div className="goal-card__meta">
                <span>{option.liquidPercentage}% liquid</span>
                <span>{100 - option.liquidPercentage}% staked</span>
              </div>
              {loading && isSelected && <span className="goal-card__spinner" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </Section>
  );
}
