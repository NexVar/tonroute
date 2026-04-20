import { TonClient } from '@ton/ton';
import { DEX, pTON } from '@ston-fi/sdk';
import { toNano } from '@ton/core';
import { env } from '@/lib/env';
import { getServerWalletSigner } from '@/lib/ton/signer';

const TESTNET_ROUTER = 'kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v';
const TESTNET_PTON = 'kQACS30DNoUQ7NfApPvzh7eBmSZ9L4ygJ-lkNWtba8TQT-Px';
const TESTNET_ASSETS = {
  tesreed: {
    symbol: 'TesREED',
    jettonAddress: 'kQDLvsZol3juZyOAVG8tWsJntOxeEZWEaWCbbSjYakQpuYN5',
  },
  testblue: {
    symbol: 'TestBlue',
    jettonAddress: 'kQB_TOJSB7q3-Jm1O8s0jKFtqLElZDPjATs5uJGsujcjznq3',
  },
} as const;

export type StonTestAssetKey = keyof typeof TESTNET_ASSETS;

function getTonClient() {
  return new TonClient({
    endpoint: env.NETWORK === 'testnet' ? 'https://testnet.toncenter.com/api/v2/jsonRPC' : 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: env.TONCENTER_API_KEY,
  });
}

export function getSupportedStonTestAssets() {
  return Object.entries(TESTNET_ASSETS).map(([key, value]) => ({ key, ...value }));
}

export async function buildTonToJettonSwapPreview(walletAddress: string, assetKey: StonTestAssetKey, amountTon: number) {
  try {
    const client = getTonClient();
    const router = client.open(DEX.v2_1.Router.CPI.create(TESTNET_ROUTER));
    const proxyTon = pTON.v2_1.create(TESTNET_PTON);
    const asset = TESTNET_ASSETS[assetKey];

    const txParams = await router.getSwapTonToJettonTxParams({
      userWalletAddress: walletAddress,
      proxyTon,
      offerAmount: toNano(amountTon),
      askJettonAddress: asset.jettonAddress,
      minAskAmount: '1',
      referralAddress: 'UQAPOmDvQZOTSt4gw2tqodbmHa9jN2m43wR-_lt6JS2cU4RJ',
      referralValue: '2',
    });

    return {
      asset,
      amountTon,
      message: {
        address: txParams.to.toString(),
        amount: txParams.value.toString(),
        payload: txParams.body?.toBoc().toString('base64') ?? '',
      },
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `STON.fi testnet swap preview is currently unavailable for ${assetKey}. The documented testnet router/pTON pair did not resolve a live swap path (${reason}).`,
    );
  }
}

export async function executeTonToJettonSwapWithServerWallet(assetKey: StonTestAssetKey, amountTon: number) {
  const signer = getServerWalletSigner();
  const { address } = await signer.getWalletContext();
  const preview = await buildTonToJettonSwapPreview(address, assetKey, amountTon);
  const result = await signer.sendTonConnectMessages([preview.message]);

  return {
    ...preview,
    broadcast: result,
  };
}
