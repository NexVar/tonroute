'use client';

import clsx from 'clsx';

interface MobileActionBarProps {
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}

export function MobileActionBar({
  label,
  hint,
  onClick,
  disabled,
  variant = 'primary',
}: MobileActionBarProps) {
  return (
    <div className={clsx('mobile-action', `mobile-action--${variant}`)} role="region" aria-label="Primary action">
      <div className="mobile-action__inner">
        {hint && <span className="mobile-action__hint">{hint}</span>}
        <button
          type="button"
          className="btn mobile-action__btn"
          onClick={onClick}
          disabled={disabled}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
