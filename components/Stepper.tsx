'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export type StepKey = 'connect' | 'analyze' | 'choose' | 'review' | 'execute' | 'done';

interface Step {
  key: StepKey;
  label: string;
}

const ORDER: Step[] = [
  { key: 'connect', label: 'Connect' },
  { key: 'analyze', label: 'Analyze' },
  { key: 'choose', label: 'Choose' },
  { key: 'review', label: 'Review' },
  { key: 'execute', label: 'Execute' },
  { key: 'done', label: 'Done' },
];

interface StepperProps {
  current: StepKey;
}

export function Stepper({ current }: StepperProps) {
  const currentIndex = ORDER.findIndex((step) => step.key === current);
  const listRef = useRef<HTMLOListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('.stepper__item--current');
    if (!active) return;
    const listRect = list.getBoundingClientRect();
    const itemRect = active.getBoundingClientRect();
    const offset = itemRect.left - listRect.left - listRect.width / 2 + itemRect.width / 2;
    list.scrollTo({ left: list.scrollLeft + offset, behavior: 'smooth' });
  }, [current]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = list;
      setAtStart(scrollLeft <= 2);
      setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
    };

    update();
    list.addEventListener('scroll', update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(list);

    return () => {
      list.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={clsx('stepper-shell', atStart && 'stepper-shell--start', atEnd && 'stepper-shell--end')}>
      <ol className="stepper" aria-label="Progress" ref={listRef}>
        {ORDER.map((step, index) => {
          const status = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending';
          return (
            <li key={step.key} className={clsx('stepper__item', `stepper__item--${status}`)}>
              <span className="stepper__bullet" aria-hidden="true">
                {status === 'done' ? '✓' : index + 1}
              </span>
              <span className="stepper__label">{step.label}</span>
            </li>
          );
        })}
      </ol>
      <span className="stepper__hint" aria-hidden="true">
        <span className="stepper__hint-dot" />
        Swipe to see all steps
      </span>
    </div>
  );
}
