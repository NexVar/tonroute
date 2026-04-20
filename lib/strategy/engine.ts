import type { AllocationPoint, ExecutionAction, PortfolioAnalysis, StrategyAlternative, StrategyGoal, StrategyRecommendation } from '@/lib/types';
import { percentOf, round, toNanoString } from '@/lib/utils';

const strategyTable: Record<StrategyGoal, { label: string; stakeTargetPercent: number; liquidPercentage: number; why: string[] }> = {
  safe: {
    label: 'Safe',
    stakeTargetPercent: 30,
    liquidPercentage: 70,
    why: [
      'Preserves most liquidity in TON while still putting some idle balance to work.',
      'Best for users who may need fast access to capital and only want a light staking allocation.',
    ],
  },
  balanced: {
    label: 'Balanced',
    stakeTargetPercent: 60,
    liquidPercentage: 40,
    why: [
      'Splits the portfolio between liquid TON and yield-bearing tsTON.',
      'Aims to improve yield without fully sacrificing flexibility.',
    ],
  },
  yield: {
    label: 'Yield',
    stakeTargetPercent: 85,
    liquidPercentage: 15,
    why: [
      'Optimizes for staking participation while retaining a thin gas/liquidity buffer.',
      'Best for users who care most about upside from idle TON and can tolerate reduced immediate liquidity.',
    ],
  },
};

const TONSTAKERS_REQUIRED_RESERVE = 1.1;
const SUPPORTED_STON_SWAP_SYMBOLS = new Set(['tesreed', 'testblue']);


function buildBefore(analysis: PortfolioAnalysis): AllocationPoint[] {
  const totalTon = analysis.balanceTon + analysis.tsTonBalance;
  return [
    {
      label: 'Liquid TON',
      ton: analysis.balanceTon,
      percentage: totalTon === 0 ? 0 : round((analysis.balanceTon / totalTon) * 100, 2),
    },
    {
      label: 'Staked tsTON',
      ton: analysis.tsTonBalance,
      percentage: totalTon === 0 ? 0 : round((analysis.tsTonBalance / totalTon) * 100, 2),
    },
  ];
}

function buildAfter(totalTon: number, stakeAmount: number): AllocationPoint[] {
  const liquidTon = round(Math.max(totalTon - stakeAmount, 0), 4);

  return [
    {
      label: 'Liquid TON',
      ton: liquidTon,
      percentage: totalTon === 0 ? 0 : round((liquidTon / totalTon) * 100, 2),
    },
    {
      label: 'Staked tsTON',
      ton: stakeAmount,
      percentage: totalTon === 0 ? 0 : round((stakeAmount / totalTon) * 100, 2),
    },
  ];
}

function buildAlternatives(selectedGoal: StrategyGoal, stakingApy: number): StrategyAlternative[] {
  return (Object.entries(strategyTable) as Array<[StrategyGoal, (typeof strategyTable)[StrategyGoal]]>)
    .filter(([goal]) => goal !== selectedGoal)
    .map(([goal, config]) => ({
      goal,
      label: config.label,
      expectedApy: round((stakingApy * config.stakeTargetPercent) / 100, 2),
      liquidPercentage: config.liquidPercentage,
      summary: `${config.label} keeps ${config.liquidPercentage}% liquid and targets roughly ${round((stakingApy * config.stakeTargetPercent) / 100, 2)}% portfolio APY at current Tonstakers rates.`,
    }));
}

export function recommendStrategy(goal: StrategyGoal, analysis: PortfolioAnalysis): StrategyRecommendation {
  const config = strategyTable[goal];
  const totalTon = round(analysis.balanceTon + analysis.tsTonBalance, 4);
  const targetStakeTon = round(percentOf(totalTon, config.stakeTargetPercent), 4);
  const maxAdditionalStakeTon = round(Math.max(analysis.balanceTon - TONSTAKERS_REQUIRED_RESERVE, 0), 4);
  const desiredAdditionalStakeTon = round(Math.max(targetStakeTon - analysis.tsTonBalance, 0), 4);
  const incrementalStakeTon = round(Math.min(desiredAdditionalStakeTon, maxAdditionalStakeTon), 4);
  const afterStakeTon = round(analysis.tsTonBalance + incrementalStakeTon, 4);
  const stakingApy = analysis.stakingMetrics?.currentApy ?? 5.2;
  const expectedPortfolioApy = round((stakingApy * config.stakeTargetPercent) / 100, 2);

  const why = [...config.why, ...analysis.insights];
  if (desiredAdditionalStakeTon > incrementalStakeTon) {
    why.push(`TonRoute caps the stake at ${incrementalStakeTon} TON to preserve the ~${TONSTAKERS_REQUIRED_RESERVE} TON fee reserve required by Tonstakers.`);
  }

  const hasSupportedSwapAsset = analysis.holdings.some(
    (holding) => holding.category === 'jetton' && SUPPORTED_STON_SWAP_SYMBOLS.has(holding.symbol.toLowerCase()),
  );

  const execution: ExecutionAction[] = [
    {
      type: 'swap',
      title: 'STON.fi rebalance',
      description: hasSupportedSwapAsset
        ? 'Optional pre-stake rebalance can route supported testnet jettons through STON.fi before staking.'
        : 'No supported STON.fi testnet swap asset is present in this wallet, so TonRoute can proceed directly to staking.',
      status: hasSupportedSwapAsset ? 'ready' : 'not_needed',
      payload: {
        endpoint: '/api/execution/swap-preview',
        supportedPairs: ['TON ↔ TesREED', 'TON ↔ TestBlue'],
      },
    },
    {
      type: 'stake',
      title: 'Tonstakers stake',
      description:
        incrementalStakeTon > 0
          ? `Stake ${incrementalStakeTon} TON into Tonstakers to move toward the ${config.label.toLowerCase()} target allocation while preserving fee reserve.`
          : 'No additional staking is needed because the current tsTON exposure already meets the target or the wallet is below the Tonstakers reserve threshold.',
      amountTon: incrementalStakeTon,
      amountAtomic: toNanoString(incrementalStakeTon),
      status: incrementalStakeTon > 0 ? 'ready' : 'not_needed',
      payload: {
        endpoint: '/api/execution/stake-preview',
      },
    },
  ];

  return {
    goal,
    label: config.label,
    why,
    portfolioAnalysis: analysis,
    before: buildBefore(analysis),
    after: buildAfter(totalTon, afterStakeTon),
    expectedApy: expectedPortfolioApy,
    liquidPercentage: config.liquidPercentage,
    alternatives: buildAlternatives(goal, stakingApy),
    execution,
  };
}
