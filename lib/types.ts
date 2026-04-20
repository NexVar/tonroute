export type NetworkName = 'mainnet' | 'testnet';
export type StrategyGoal = 'safe' | 'balanced' | 'yield';
export type ActionType = 'swap' | 'stake' | 'noop';

export interface PortfolioHolding {
  symbol: string;
  assetAddress?: string;
  amountAtomic: string;
  amountDisplay: string;
  decimals: number;
  category: 'native' | 'liquid-staking' | 'jetton';
  liquid: boolean;
  apy?: number;
  priceUsd?: number;
}

export interface TonstakersMetrics {
  currentApy: number;
  tvlTon: number;
  stakersCount: number;
  rates: Record<string, number>;
}

export interface PortfolioAnalysis {
  address: string;
  network: NetworkName;
  balanceTon: number;
  idleTon: number;
  idleTonAtomic: string;
  tsTonBalance: number;
  holdings: PortfolioHolding[];
  insights: string[];
  supportedActions: Array<'stake' | 'swap'>;
  lastUpdated: string;
  stakingMetrics?: TonstakersMetrics;
}

export interface AllocationPoint {
  label: string;
  ton: number;
  percentage: number;
}

export interface StrategyAlternative {
  goal: StrategyGoal;
  label: string;
  expectedApy: number;
  liquidPercentage: number;
  summary: string;
}

export interface ExecutionAction {
  type: ActionType;
  title: string;
  description: string;
  amountTon?: number;
  amountAtomic?: string;
  assetIn?: string;
  assetOut?: string;
  status: 'ready' | 'not_needed' | 'unsupported';
  payload?: Record<string, unknown>;
}

export interface StrategyRecommendation {
  goal: StrategyGoal;
  label: string;
  why: string[];
  portfolioAnalysis: PortfolioAnalysis;
  before: AllocationPoint[];
  after: AllocationPoint[];
  expectedApy: number;
  liquidPercentage: number;
  alternatives: StrategyAlternative[];
  execution: ExecutionAction[];
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  details?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
