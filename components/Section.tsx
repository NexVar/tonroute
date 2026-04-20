import type { ReactNode } from 'react';
import clsx from 'clsx';

interface SectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'subtle';
}

export function Section({ eyebrow, title, description, actions, children, className, tone = 'default' }: SectionProps) {
  return (
    <section className={clsx('panel', tone === 'subtle' && 'panel--subtle', className)}>
      {(eyebrow || title || description || actions) && (
        <header className="panel__header">
          <div>
            {eyebrow && <p className="panel__eyebrow">{eyebrow}</p>}
            {title && <h2 className="panel__title">{title}</h2>}
            {description && <p className="panel__description">{description}</p>}
          </div>
          {actions && <div className="panel__actions">{actions}</div>}
        </header>
      )}
      <div className="panel__body">{children}</div>
    </section>
  );
}
