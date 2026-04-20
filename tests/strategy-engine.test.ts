import { describe, expect, it } from 'vitest';
import { recommendStrategy } from '@/lib/strategy/engine';
import type { PortfolioAnalysis } from '@/lib/types';

const basePortfolio: PortfolioAnalysis = {
  address: 'EQTEST',
  network: 'testnet',
  balanceTon: 10,
  idleTon: 9.75,
  idleTonAtomic: '9750000000',
  tsTonBalance: 0,
  holdings: [
    {
      symbol: 'TON',
      amountAtomic: '10000000000',
      amountDisplay: '10',
      decimals: 9,
      category: 'native',
      liquid: true
    }
  ],
  insights: ['Idle TON detected'],
  supportedActions: ['stake', 'swap'],
  lastUpdated: new Date().toISOString()
};

describe('recommendStrategy', () => {
  it('builds a yield recommendation with a stake action', () => {
    const result = recommendStrategy('yield', basePortfolio);

    expect(result.label).toBe('Yield');
    expect(result.execution.find((step) => step.type === 'stake')?.status).toBe('ready');
    expect(result.after.find((entry) => entry.label === 'Staked tsTON')?.ton).toBeGreaterThan(8);
  });

  it('skips incremental staking when tsTON already exceeds the target', () => {
    const result = recommendStrategy('safe', {
      ...basePortfolio,
      tsTonBalance: 5
    });

    expect(result.execution.find((step) => step.type === 'stake')?.status).toBe('not_needed');
  });
});
