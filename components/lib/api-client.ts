import type {
  ApiResponse,
  ExecutionAction,
  PortfolioAnalysis,
  StrategyGoal,
  StrategyRecommendation,
} from '@/lib/types';

export class ApiClientError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status: number, details?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

async function parseResponse<TResponse>(response: Response): Promise<TResponse> {
  let payload: ApiResponse<TResponse> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<TResponse>;
  } catch {
    throw new ApiClientError(`Unexpected response (${response.status})`, response.status);
  }

  if (!payload || payload.ok !== true) {
    const message = payload && 'error' in payload ? payload.error : `Request failed (${response.status})`;
    const details = payload && 'details' in payload ? payload.details : undefined;
    throw new ApiClientError(message, response.status, details);
  }

  return payload.data;
}

async function postJson<TBody, TResponse>(path: string, body: TBody, signal?: AbortSignal): Promise<TResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  return parseResponse<TResponse>(response);
}

async function getJson<TResponse>(path: string, signal?: AbortSignal): Promise<TResponse> {
  const response = await fetch(path, { signal, cache: 'no-store' });
  return parseResponse<TResponse>(response);
}

export function fetchPortfolio(address: string, signal?: AbortSignal): Promise<PortfolioAnalysis> {
  return postJson<{ address: string }, PortfolioAnalysis>('/api/portfolio/analyze', { address }, signal);
}

export function fetchRecommendation(
  address: string,
  goal: StrategyGoal,
  signal?: AbortSignal,
): Promise<StrategyRecommendation> {
  return postJson<{ address: string; goal: StrategyGoal }, StrategyRecommendation>(
    '/api/strategies/recommend',
    { address, goal },
    signal,
  );
}

export interface ExecutionPlan {
  address: string;
  goal: StrategyGoal;
  execution: ExecutionAction[];
  summary: string;
}

export interface DevWalletInfo {
  address: string;
  balanceTon: number;
  mode: 'local-demo';
}

export interface TonConnectLikeTransaction {
  validUntil: number;
  messages: Array<{
    address: string;
    amount: string;
    payload?: string;
  }>;
}

export function fetchExecutionPlan(
  address: string,
  goal: StrategyGoal,
  signal?: AbortSignal,
): Promise<ExecutionPlan> {
  return postJson<{ address: string; goal: StrategyGoal }, ExecutionPlan>(
    '/api/execution/plan',
    { address, goal },
    signal,
  );
}

export function fetchDevWallet(signal?: AbortSignal): Promise<DevWalletInfo> {
  return getJson<DevWalletInfo>('/api/dev-wallet', signal);
}

export function prepareStakeTransaction(address: string, amountTon: number, signal?: AbortSignal) {
  return postJson<{ address: string; amountTon: number }, TonConnectLikeTransaction>(
    '/api/execution/stake-preview',
    { address, amountTon },
    signal,
  );
}

export function executeStakeWithDemoWallet(amountTon: number, signal?: AbortSignal) {
  return postJson<{ amountTon: number }, { walletAddress: string; tx: TonConnectLikeTransaction }>(
    '/api/execution/stake-execute',
    { amountTon },
    signal,
  );
}
