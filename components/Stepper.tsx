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
  { key: 'done', label: 'Done' }
];

interface StepperProps {
  current: StepKey;
}

export function Stepper({ current }: StepperProps) {
  const currentIndex = ORDER.findIndex((step) => step.key === current);

  return (
    <ol className="stepper" aria-label="Progress">
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
  );
}
