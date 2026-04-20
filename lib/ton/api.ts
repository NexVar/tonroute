import { getTonstakersMetrics } from '@/lib/integrations/tonstakers';
import { env } from '@/lib/env';
import { normalizeAddress } from '@/lib/ton/address';
import type { PortfolioAnalysis, PortfolioHolding } from '@/lib/types';
import { fromNanoString, round, toNanoString } from '@/lib/utils';

const TONAPI_BASE = env.NETWORK === 'testnet' ? 'https://testnet.tonapi.io' : 'https://tonapi.io';
const TONCENTER_BASE = env.NETWORK === 'testnet' ? 'https://testnet.toncenter.com/api/v2' : 'https://toncenter.com/api/v2';
const ANALYSIS_CACHE_TTL_MS = 30_000;
const TONAPI_RETRIES = 2;

interface TonApiJettonsResponse {
  balances?: Array<{
    balance: string;
    jetton?: {
      address?: string;
      symbol?: string;
      name?: string;
      decimals?: number;
    };
    price?: { prices?: { USD?: number } };
  }>;
}

interface TonCenterBalanceResponse {
  ok: boolean;
  result: string;
}

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const analysisCache = new Map<string, CacheEntry<PortfolioAnalysis>>();
const analysisInFlight = new Map<string, Promise<PortfolioAnalysis>>();
const jettonCache = new Map<string, CacheEntry<TonApiJettonsResponse>>();

function readCache<T>(cache: Map<string, CacheEntry<T>>, key: string) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function writeCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, {
    expiresAt: Date.now() + ANALYSIS_CACHE_TTL_MS,
    value,
  });
}

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function tonApiFetch<T>(path: string): Promise<T> {
  let lastStatus = 0;

  for (let attempt = 0; attempt <= TONAPI_RETRIES; attempt += 1) {
    const response = await fetch(`${TONAPI_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${env.TONAPI_KEY}`,
      },
      next: { revalidate: 30 },
    });

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    lastStatus = response.status;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === TONAPI_RETRIES) {
      throw new Error(`TonAPI request failed (${response.status}) for ${path}`);
    }

    await delay(250 * (attempt + 1));
  }

  throw new Error(`TonAPI request failed (${lastStatus}) for ${path}`);
}

async function fetchTonCenterBalance(address: string) {
  const response = await fetch(`${TONCENTER_BASE}/getAddressBalance?address=${encodeURIComponent(address)}`, {
    headers: {
      'X-API-Key': env.TONCENTER_API_KEY,
    },
    next: { revalidate: 5 },
  });

  if (!response.ok) {
    throw new Error(`TonCenter balance request failed (${response.status}).`);
  }

  const payload = (await response.json()) as TonCenterBalanceResponse;
  if (!payload.ok) {
    throw new Error('TonCenter balance request returned ok=false.');
  }

  return payload.result;
}

export async function analyzePortfolio(address: string): Promise<PortfolioAnalysis> {
  const normalized = normalizeAddress(address);
  const cachedAnalysis = readCache(analysisCache, normalized);
  if (cachedAnalysis) {
    return cachedAnalysis;
  }

  const existingRequest = analysisInFlight.get(normalized);
  if (existingRequest) {
    return existingRequest;
  }

  const analysisPromise = (async () => {
    const cachedJettons = readCache(jettonCache, normalized);
    let usedFallbackJettons = false;

    const [balanceAtomic, jettons, stakingMetrics] = await Promise.all([
      fetchTonCenterBalance(normalized),
      tonApiFetch<TonApiJettonsResponse>(`/v2/accounts/${normalized}/jettons`)
        .then((response) => {
          writeCache(jettonCache, normalized, response);
          return response;
        })
        .catch((error) => {
          console.warn(`TonAPI jetton fetch failed for ${normalized}:`, error);
          usedFallbackJettons = true;
          return cachedJettons ?? { balances: [] };
        }),
      getTonstakersMetrics(normalized).catch(() => undefined),
    ]);

    const balanceTon = round(fromNanoString(balanceAtomic), 4);

    const jettonHoldings: PortfolioHolding[] = (jettons.balances ?? []).map((entry) => {
      const decimals = entry.jetton?.decimals ?? 9;
      const amount = Number(BigInt(entry.balance || '0')) / 10 ** decimals;
      const symbol = entry.jetton?.symbol || entry.jetton?.name || 'JETTON';
      const isTsTon = symbol.toLowerCase() === 'tston';

      return {
        symbol,
        assetAddress: entry.jetton?.address,
        amountAtomic: entry.balance,
        amountDisplay: round(amount, 4).toString(),
        decimals,
        category: isTsTon ? 'liquid-staking' : 'jetton',
        liquid: !isTsTon,
        apy: isTsTon ? stakingMetrics?.currentApy : undefined,
        priceUsd: entry.price?.prices?.USD,
      };
    });

    const tsTonHolding = jettonHoldings.find((holding) => holding.symbol.toLowerCase() === 'tston');
    const tsTonBalance = tsTonHolding ? Number(tsTonHolding.amountDisplay) : 0;
    const idleTon = round(Math.max(balanceTon - 0.25, 0), 4);

    const holdings: PortfolioHolding[] = [
      {
        symbol: 'TON',
        amountAtomic: balanceAtomic,
        amountDisplay: balanceTon.toString(),
        decimals: 9,
        category: 'native',
        liquid: true,
        priceUsd: stakingMetrics?.rates?.TONUSD,
      },
      ...jettonHoldings,
    ];

    const insights = [
      idleTon > 0
        ? `Detected ${idleTon} TON available beyond a 0.25 TON gas reserve.`
        : 'Wallet balance is below the recommended reserve threshold, so TonRoute will avoid suggesting a stake action.',
      tsTonBalance > 0
        ? `Found existing tsTON exposure (${tsTonBalance} tsTON), which the strategy engine includes in portfolio comparisons.`
        : 'No existing tsTON position detected.',
    ];

    if (usedFallbackJettons) {
      insights.push(
        cachedJettons
          ? 'Jetton balances were served from a recent cache because TonAPI rate-limited the live refresh.'
          : 'Jetton balances could not be refreshed from TonAPI, so TonRoute temporarily fell back to TON-only analysis.',
      );
    }

    if (stakingMetrics) {
      insights.push(`Tonstakers currently reports ${round(stakingMetrics.currentApy, 2)}% APY and ${Math.round(stakingMetrics.stakersCount).toLocaleString()} stakers.`);
    }

    const result = {
      address: normalized,
      network: env.NETWORK,
      balanceTon,
      idleTon,
      idleTonAtomic: toNanoString(idleTon),
      tsTonBalance,
      holdings,
      insights,
      supportedActions: ['stake', 'swap'] as Array<'stake' | 'swap'>,
      lastUpdated: new Date().toISOString(),
      stakingMetrics,
    };

    writeCache(analysisCache, normalized, result);
    return result;
  })();

  analysisInFlight.set(normalized, analysisPromise);

  try {
    return await analysisPromise;
  } finally {
    analysisInFlight.delete(normalized);
  }
}
