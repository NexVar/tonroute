'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsConnectionRestored, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import type { PortfolioAnalysis, StrategyGoal, StrategyRecommendation } from '@/lib/types';
import {
  ApiClientError,
  executeStakeWithDemoWallet,
  fetchDevWallet,
  fetchExecutionPlan,
  fetchPortfolio,
  fetchRecommendation,
  prepareStakeTransaction,
  type DevWalletInfo,
  type ExecutionPlan,
} from './lib/api-client';
import { ErrorCallout } from './ErrorCallout';
import { ExecutionFlow, type StepRuntimeStatus } from './ExecutionFlow';
import { GoalSelector } from './GoalSelector';
import { Header } from './Header';
import { PortfolioCard } from './PortfolioCard';
import { RecommendationCard } from './RecommendationCard';
import { ResultCard } from './ResultCard';
import { SkeletonPanel } from './SkeletonPanel';
import { Stepper, type StepKey } from './Stepper';
import { WalletGate } from './WalletGate';

interface RequestError {
  message: string;
  details?: string;
}

function toRequestError(error: unknown): RequestError {
  if (error instanceof ApiClientError) {
    return { message: error.message, details: error.details };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: 'Unknown error' };
}

const DEMO_WALLET_ENABLED = (() => {
  const raw = process.env.NEXT_PUBLIC_ENABLE_DEMO_WALLET;
  if (raw == null) return process.env.NODE_ENV !== 'production';
  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
})();

export function TonRouteApp() {
  const restored = useIsConnectionRestored();
  const tonConnectAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const [demoWallet, setDemoWallet] = useState<DevWalletInfo | null>(null);
  const [demoWalletLoading, setDemoWalletLoading] = useState(false);
  const [restoreTimedOut, setRestoreTimedOut] = useState(false);

  const activeAddress = tonConnectAddress || demoWallet?.address || null;
  const walletMode: 'none' | 'tonconnect' | 'demo' = tonConnectAddress ? 'tonconnect' : demoWallet ? 'demo' : 'none';

  const [portfolio, setPortfolio] = useState<PortfolioAnalysis | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<RequestError | null>(null);

  const [goal, setGoal] = useState<StrategyGoal | null>(null);
  const [recommendation, setRecommendation] = useState<StrategyRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<RequestError | null>(null);

  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<RequestError | null>(null);

  const [runtime, setRuntime] = useState<Record<number, StepRuntimeStatus>>({});
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);


  useEffect(() => {
    if (restored) return;
    const timeout = window.setTimeout(() => setRestoreTimedOut(true), 2500);
    return () => window.clearTimeout(timeout);
  }, [restored]);

  const portfolioAbort = useRef<AbortController | null>(null);
  const recommendationAbort = useRef<AbortController | null>(null);
  const planAbort = useRef<AbortController | null>(null);

  const resetRouteState = useCallback(() => {
    setPortfolio(null);
    setGoal(null);
    setRecommendation(null);
    setPlan(null);
    setPortfolioError(null);
    setRecommendationError(null);
    setPlanError(null);
    setRuntime({});
    setRunning(false);
    setFinished(false);
    setExecutionError(null);
  }, []);

  const loadPortfolio = useCallback(async (target: string) => {
    portfolioAbort.current?.abort();
    const controller = new AbortController();
    portfolioAbort.current = controller;
    setPortfolioLoading(true);
    setPortfolioError(null);
    try {
      const result = await fetchPortfolio(target, controller.signal);
      setPortfolio(result);
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') return;
      setPortfolioError(toRequestError(error));
    } finally {
      if (portfolioAbort.current === controller) {
        setPortfolioLoading(false);
      }
    }
  }, []);

  const loadRecommendation = useCallback(async (target: string, nextGoal: StrategyGoal) => {
    recommendationAbort.current?.abort();
    const controller = new AbortController();
    recommendationAbort.current = controller;
    setRecommendationLoading(true);
    setRecommendationError(null);
    try {
      const result = await fetchRecommendation(target, nextGoal, controller.signal);
      setRecommendation(result);
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') return;
      setRecommendationError(toRequestError(error));
    } finally {
      if (recommendationAbort.current === controller) {
        setRecommendationLoading(false);
      }
    }
  }, []);

  const loadPlan = useCallback(async (target: string, nextGoal: StrategyGoal) => {
    planAbort.current?.abort();
    const controller = new AbortController();
    planAbort.current = controller;
    setPlanLoading(true);
    setPlanError(null);
    try {
      const result = await fetchExecutionPlan(target, nextGoal, controller.signal);
      setPlan(result);
      setRuntime({});
      setFinished(false);
      setExecutionError(null);
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') return;
      setPlanError(toRequestError(error));
    } finally {
      if (planAbort.current === controller) {
        setPlanLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!(restored || restoreTimedOut)) return;
    if (!activeAddress) {
      const timeout = window.setTimeout(resetRouteState, 0);
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(() => {
      void loadPortfolio(activeAddress);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [activeAddress, restored, restoreTimedOut, loadPortfolio, resetRouteState]);

  const handleUseDemoWallet = useCallback(async () => {
    setDemoWalletLoading(true);
    setPortfolioError(null);
    try {
      const wallet = await fetchDevWallet();
      setDemoWallet(wallet);
    } catch (error) {
      setPortfolioError(toRequestError(error));
    } finally {
      setDemoWalletLoading(false);
    }
  }, []);

  const handleSelectGoal = useCallback(
    (nextGoal: StrategyGoal) => {
      if (!activeAddress) return;
      setGoal(nextGoal);
      setPlan(null);
      setRuntime({});
      setFinished(false);
      void loadRecommendation(activeAddress, nextGoal);
    },
    [activeAddress, loadRecommendation],
  );

  const handleContinueToExecution = useCallback(() => {
    if (!activeAddress || !goal) return;
    void loadPlan(activeAddress, goal);
  }, [activeAddress, goal, loadPlan]);

  const handleStartExecution = useCallback(async () => {
    if (!plan || !activeAddress) return;
    setRunning(true);
    setExecutionError(null);
    setFinished(false);
    const next: Record<number, StepRuntimeStatus> = {};
    plan.execution.forEach((step, index) => {
      next[index] = step.status === 'ready' ? 'pending' : 'skipped';
    });
    setRuntime({ ...next });

    try {
      for (let index = 0; index < plan.execution.length; index += 1) {
        const step = plan.execution[index];
        if (step.status !== 'ready') continue;
        next[index] = 'in_progress';
        setRuntime({ ...next });

        if (step.type === 'stake' && step.amountTon && step.amountTon > 0) {
          if (walletMode === 'demo') {
            await executeStakeWithDemoWallet(step.amountTon);
          } else {
            const tx = await prepareStakeTransaction(activeAddress, step.amountTon);
            await tonConnectUI.sendTransaction(tx);
          }
        } else if (step.type === 'swap') {
          throw new Error('This wallet does not currently expose a concrete STON.fi swap payload. Connect an asset-holding wallet to activate the rebalance step.');
        }

        next[index] = 'completed';
        setRuntime({ ...next });
      }
      setFinished(true);
      void loadPortfolio(activeAddress);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Execution failed';
      setExecutionError(message);
      const failedIndex = Object.entries(next).find(([, status]) => status === 'in_progress')?.[0];
      if (failedIndex) {
        next[Number(failedIndex)] = 'failed';
        setRuntime({ ...next });
      }
    } finally {
      setRunning(false);
    }
  }, [activeAddress, plan, tonConnectUI, walletMode, loadPortfolio]);

  const handleResetExecution = useCallback(() => {
    setPlan(null);
    setRuntime({});
    setFinished(false);
    setExecutionError(null);
    setRecommendation(null);
    setGoal(null);
  }, []);

  const handleRefresh = useCallback(() => {
    if (!activeAddress) return;
    void loadPortfolio(activeAddress);
  }, [activeAddress, loadPortfolio]);

  const currentStep: StepKey = useMemo(() => {
    if (!activeAddress) return 'connect';
    if (!portfolio) return 'analyze';
    if (finished) return 'done';
    if (plan) return 'execute';
    if (recommendation) return 'review';
    return 'choose';
  }, [activeAddress, portfolio, recommendation, plan, finished]);

  const walletReady = restored || restoreTimedOut;
  const showWalletGate = walletReady && !activeAddress;
  const initialising = !walletReady;

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <section className="hero">
          <p className="hero__eyebrow">TonRoute</p>
          <h1 className="hero__title">Put your idle TON to work — without guessing.</h1>
          <p className="hero__subtitle">
            Connect your wallet, pick the goal that fits, and TonRoute drafts a comparison and a one-click execution plan
            across STON.fi and Tonstakers.
          </p>
          {walletMode === 'demo' && demoWallet && (
            <p className="hero__badge">Using local demo wallet {demoWallet.address}</p>
          )}
        </section>

        <Stepper current={currentStep} />

        {initialising && <SkeletonPanel label="Restoring wallet session" rows={2} />}

        {showWalletGate && (
          <WalletGate
            onUseDemoWallet={DEMO_WALLET_ENABLED ? handleUseDemoWallet : undefined}
            demoLoading={demoWalletLoading}
          />
        )}

        {activeAddress && (
          <>
            {portfolioError && (
              <ErrorCallout
                title="Wallet analysis failed"
                message={portfolioError.message}
                details={portfolioError.details}
                onRetry={handleRefresh}
              />
            )}
            {!portfolio && portfolioLoading && <SkeletonPanel label="Reading wallet balances" rows={4} />}
            {portfolio && (
              <PortfolioCard analysis={portfolio} onRefresh={handleRefresh} refreshing={portfolioLoading} />
            )}

            {portfolio && (
              <GoalSelector
                selected={goal}
                onSelect={handleSelectGoal}
                loading={recommendationLoading}
                disabled={recommendationLoading || running}
              />
            )}

            {recommendationError && (
              <ErrorCallout
                title="Could not build recommendation"
                message={recommendationError.message}
                details={recommendationError.details}
                onRetry={() => goal && activeAddress && loadRecommendation(activeAddress, goal)}
              />
            )}
            {goal && !recommendation && recommendationLoading && <SkeletonPanel label="Modeling outcomes" rows={5} />}
            {recommendation && !plan && !finished && (
              <RecommendationCard
                recommendation={recommendation}
                onSelectAlternative={handleSelectGoal}
                onContinue={handleContinueToExecution}
                busy={planLoading || recommendationLoading}
              />
            )}

            {planError && (
              <ErrorCallout
                title="Could not prepare execution plan"
                message={planError.message}
                details={planError.details}
                onRetry={handleContinueToExecution}
              />
            )}
            {planLoading && !plan && <SkeletonPanel label="Preparing execution plan" rows={3} />}
            {plan && !finished && (
              <ExecutionFlow
                plan={plan}
                runtime={runtime}
                running={running}
                finished={finished}
                onStart={handleStartExecution}
                onReset={handleResetExecution}
                errorMessage={executionError}
              />
            )}

            {finished && recommendation && <ResultCard recommendation={recommendation} onReset={handleResetExecution} />}
          </>
        )}
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} TonRoute</span>
        <span className="site-footer__sep">·</span>
        <a href="https://ston.fi" target="_blank" rel="noreferrer">
          STON.fi
        </a>
        <span className="site-footer__sep">·</span>
        <a href="https://tonstakers.com" target="_blank" rel="noreferrer">
          Tonstakers
        </a>
      </footer>
    </div>
  );
}
