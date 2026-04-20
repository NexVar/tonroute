import { createRequire } from 'node:module';
import { Address, beginCell, toNano } from '@ton/core';
import { CHAIN } from '@tonconnect/sdk';
import { env } from '@/lib/env';
import { getServerWalletSigner } from '@/lib/ton/signer';

const require = createRequire(import.meta.url);
const { Tonstakers } = require('tonstakers-sdk') as typeof import('tonstakers-sdk');

const TESTNET_CHAIN = '-3';
const MAINNET_CHAIN = '-239';
const TONSTAKERS_TESTNET_ADDRESS = 'kQANFsYyYn-GSZ4oajUJmboDURZU-udMHf9JxzO4vYM_hFP3';
const TONSTAKERS_MAINNET_ADDRESS = 'EQCkWxfyhAkim3g2DjKQQg8T5P4g-Q1-K_jErGcDJZ4i-vqR';
const TONSTAKERS_STAKE_OPCODE = 0x47d54391;
const TONSTAKERS_STAKE_FEE_RESERVE = 1;
const TONSTAKERS_PARTNER_CODE = 0;

type TonstakersMessage = {
  address: string;
  amount: string;
  payload: string;
};

type TonstakersTransactionDetails = {
  validUntil: number;
  network?: CHAIN;
  messages: TonstakersMessage[];
};

class BaseConnector {
  protected readonly walletAddress: string;
  private readonly chain: string;
  lastTransaction: TonstakersTransactionDetails | null = null;

  constructor(walletAddress: string, chain = env.NETWORK === 'testnet' ? TESTNET_CHAIN : MAINNET_CHAIN) {
    this.walletAddress = walletAddress;
    this.chain = chain;
  }

  onStatusChange(callback: (wallet: { account: { address: string; chain: string } }) => void) {
    queueMicrotask(() => {
      callback({
        account: {
          address: this.walletAddress,
          chain: this.chain,
        },
      });
    });

    return () => undefined;
  }
}

async function applyTonstakersTestnetFix(tonstakers: InstanceType<typeof Tonstakers>) {
  if (env.NETWORK !== 'testnet') return tonstakers;
  const anyTonstakers = tonstakers as unknown as {
    isTestnet: boolean;
    stakingContractAddress?: Address;
  };
  anyTonstakers.isTestnet = true;
  anyTonstakers.stakingContractAddress = Address.parse(TONSTAKERS_TESTNET_ADDRESS);
  return tonstakers;
}

class CaptureConnector extends BaseConnector {
  async sendTransaction(transactionDetails: TonstakersTransactionDetails): Promise<{ boc: string }> {
    this.lastTransaction = transactionDetails;
    return { boc: 'captured' };
  }
}

async function waitUntilReady(tonstakers: InstanceType<typeof Tonstakers>) {
  if (tonstakers.ready) {
    return tonstakers;
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Tonstakers SDK initialization timed out.')), 10_000);

    tonstakers.addEventListener(
      'initialized',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });

  return applyTonstakersTestnetFix(tonstakers);
}

function buildStakeMessage(amountTon: number) {
  const amount = toNano(amountTon);
  const totalValue = amount + toNano(TONSTAKERS_STAKE_FEE_RESERVE);
  const stakingAddress = Address.parse(
    env.NETWORK === 'testnet' ? TONSTAKERS_TESTNET_ADDRESS : TONSTAKERS_MAINNET_ADDRESS,
  );
  const payload = beginCell()
    .storeUint(TONSTAKERS_STAKE_OPCODE, 32)
    .storeUint(1, 64)
    .storeUint(TONSTAKERS_PARTNER_CODE, 64)
    .endCell()
    .toBoc()
    .toString('base64');

  return {
    validUntil: Math.floor(Date.now() / 1000) + 10 * 60,
    network: env.NETWORK === 'testnet' ? CHAIN.TESTNET : CHAIN.MAINNET,
    messages: [
      {
        address: stakingAddress.toString({
          bounceable: true,
          urlSafe: true,
          testOnly: env.NETWORK === 'testnet',
        }),
        amount: totalValue.toString(),
        payload,
      },
    ],
  } satisfies TonstakersTransactionDetails;
}

export async function getTonstakersMetrics(walletAddress: string) {
  const connector = new CaptureConnector(walletAddress);
  const tonstakers = await waitUntilReady(
    new Tonstakers({
      connector,
      tonApiKey: env.TONAPI_KEY,
    }),
  );

  const [currentApy, tvl, stakersCount, rates] = await Promise.all([
    tonstakers.getCurrentApy(),
    tonstakers.getTvl(),
    tonstakers.getStakersCount(),
    tonstakers.getRates(),
  ]);

  return {
    currentApy,
    tvlTon: Number(tvl) / 1_000_000_000,
    stakersCount,
    rates,
  };
}

export async function prepareStakeTransaction(_walletAddress: string, amountTon: number) {
  return buildStakeMessage(amountTon);
}

export async function executeStakeWithServerWallet(amountTon: number) {
  const signer = getServerWalletSigner();
  const { address } = await signer.getWalletContext();
  const tx = buildStakeMessage(amountTon);
  await signer.sendTonConnectMessages(tx.messages);

  return {
    walletAddress: address,
    tx,
  };
}
