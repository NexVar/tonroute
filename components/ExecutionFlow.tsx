'use client';

import clsx from 'clsx';
import type { ExecutionAction, NetworkName } from '@/lib/types';
import type { ExecutionPlan } from './lib/api-client';
import { Section } from './Section';
import { formatTon } from './lib/format';

export type StepRuntimeStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';

interface ExecutionFlowProps {
  plan: ExecutionPlan;
  runtime: Record<number, StepRuntimeStatus>;
  running: boolean;
  finished: boolean;
  onStart: () => void;
  onReset: () => void;
  errorMessage?: string | null;
  network?: NetworkName;
  walletAddress?: string;
}

function deriveDisplayStatus(action: ExecutionAction, runtime: StepRuntimeStatus | undefined): StepRuntimeStatus {
  if (runtime) return runtime;
  if (action.status === 'not_needed') return 'skipped';
  if (action.status === 'unsupported') return 'skipped';
  return 'pending';
}

const STATUS_LABELS: Record<StepRuntimeStatus, string> = {
  pending: 'Pending',
  in_progress: 'Signing…',
  completed: 'Confirmed',
  skipped: 'Not needed',
  failed: 'Failed',
};

const GAS_ESTIMATE: Record<string, string> = {
  stake: '~0.05 TON',
  swap: '~0.1 TON',
  noop: '—',
};

const TIME_ESTIMATE: Record<string, string> = {
  stake: '~10s',
  swap: '~15s',
  noop: '—',
};

function tonviewerBase(network?: NetworkName): string {
  return network === 'testnet' ? 'https://testnet.tonviewer.com' : 'https://tonviewer.com';
}

export function ExecutionFlow({
  plan,
  runtime,
  running,
  finished,
  onStart,
  onReset,
  errorMessage,
  network,
  walletAddress,
}: ExecutionFlowProps) {
  const actionableSteps = plan.execution.filter((step) => step.status === 'ready');
  const hasWork = actionableSteps.length > 0;

  return (
    <Section
      eyebrow="Step 05"
      title={
        <>
          Execution <em>plan</em>
        </>
      }
      description={plan.summary}
      actions={
        finished ? (
          <button type="button" className="btn btn--ghost" onClick={onReset}>
            Plan another route
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            onClick={onStart}
            disabled={running || !hasWork}
          >
            {running ? 'Running…' : hasWork ? 'Begin execution' : 'Nothing to execute'}
          </button>
        )
      }
    >
      <ol className="execution">
        {plan.execution.map((step, index) => {
          const status = deriveDisplayStatus(step, runtime[index]);
          const showViewerLink = status === 'completed' && walletAddress;
          return (
            <li key={`${step.type}-${index}`} className={clsx('execution__step', `execution__step--${status}`)}>
              <div className="execution__indicator" aria-hidden="true">
                {status === 'completed' && '✓'}
                {status === 'in_progress' && <span className="execution__spinner" />}
                {status === 'failed' && '!'}
                {status === 'skipped' && '–'}
                {status === 'pending' && index + 1}
              </div>
              <div className="execution__body">
                <div className="execution__head">
                  <h3>{step.title}</h3>
                  <span className={`tag tag--status tag--${status}`}>{STATUS_LABELS[status]}</span>
                </div>
                <p>{step.description}</p>
                <dl className="execution__meta">
                  <div>
                    <dt>Action</dt>
                    <dd>{step.type}</dd>
                  </div>
                  {typeof step.amountTon === 'number' && step.amountTon > 0 && (
                    <div>
                      <dt>Amount</dt>
                      <dd>{formatTon(step.amountTon)} TON</dd>
                    </div>
                  )}
                  {step.assetIn && (
                    <div>
                      <dt>From</dt>
                      <dd>{step.assetIn}</dd>
                    </div>
                  )}
                  {step.assetOut && (
                    <div>
                      <dt>To</dt>
                      <dd>{step.assetOut}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Gas est.</dt>
                    <dd>{GAS_ESTIMATE[step.type] ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Confirm</dt>
                    <dd>{TIME_ESTIMATE[step.type] ?? '—'}</dd>
                  </div>
                </dl>
                {showViewerLink && (
                  <a
                    href={`${tonviewerBase(network)}/${walletAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="execution__link"
                  >
                    View on tonviewer →
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {errorMessage && <p className="execution__error" role="alert">{errorMessage}</p>}
      <p className="execution__footnote">
        Wallet signing &amp; on-chain submission for STON.fi and Tonstakers steps are wired by the execution layer; this
        view reflects the plan and routes the request once that wiring is in place.
      </p>
    </Section>
  );
}
