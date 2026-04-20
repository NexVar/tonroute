'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(OPTIONS.findIndex((o) => o.recommended));

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const update = () => {
      const first = grid.firstElementChild as HTMLElement | null;
      if (!first) return;
      const cardWidth = first.getBoundingClientRect().width;
      const style = window.getComputedStyle(grid);
      const gap = parseFloat(style.columnGap || style.gap || '0');
      const idx = Math.round(grid.scrollLeft / (cardWidth + gap));
      setActiveIdx(Math.min(OPTIONS.length - 1, Math.max(0, idx)));
    };

    update();
    grid.addEventListener('scroll', update, { passive: true });
    return () => grid.removeEventListener('scroll', update);
  }, []);

  const scrollToIdx = useCallback((idx: number) => {
    const grid = gridRef.current;
    if (!grid) return;
    const first = grid.firstElementChild as HTMLElement | null;
    if (!first) return;
    const cardWidth = first.getBoundingClientRect().width;
    const style = window.getComputedStyle(grid);
    const gap = parseFloat(style.columnGap || style.gap || '0');
    grid.scrollTo({ left: idx * (cardWidth + gap), behavior: 'smooth' });
  }, []);

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
      <div className="goal-grid" role="radiogroup" aria-label="Strategy goal" ref={gridRef}>
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

      <div className="goal-dots" role="tablist" aria-label="Goal pagination">
        {OPTIONS.map((option, idx) => (
          <button
            key={option.goal}
            type="button"
            role="tab"
            aria-selected={idx === activeIdx}
            aria-label={`Show ${option.label} option`}
            className={clsx('goal-dot', idx === activeIdx && 'goal-dot--active')}
            onClick={() => scrollToIdx(idx)}
          />
        ))}
      </div>
    </Section>
  );
}
