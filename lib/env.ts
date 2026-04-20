import { z } from 'zod';

const envSchema = z.object({
  NETWORK: z.enum(['mainnet', 'testnet']).default('testnet'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_ENABLE_DEMO_WALLET: z.string().optional(),
  ENABLE_DEMO_WALLET: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1).optional(),
  TONCENTER_API_KEY: z.string().min(1),
  TONAPI_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  WALLET_VERSION: z.string().min(1).optional(),
  TON_WALLET_ADDRESS: z.string().min(1).optional(),
  MNEMONIC: z.string().min(1).optional(),
  PRIVATE_KEY: z.string().min(1).optional(),
  TON_WALLET_PUBLIC_KEY: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  NETWORK: process.env.NETWORK,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  NEXT_PUBLIC_ENABLE_DEMO_WALLET: process.env.NEXT_PUBLIC_ENABLE_DEMO_WALLET,
  ENABLE_DEMO_WALLET: process.env.ENABLE_DEMO_WALLET,
  TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
  TONCENTER_API_KEY: process.env.TONCENTER_API_KEY,
  TONAPI_KEY: process.env.TONAPI_KEY,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  WALLET_VERSION: process.env.WALLET_VERSION,
  TON_WALLET_ADDRESS: process.env.TON_WALLET_ADDRESS,
  MNEMONIC: process.env.MNEMONIC,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  TON_WALLET_PUBLIC_KEY: process.env.TON_WALLET_PUBLIC_KEY,
});

const trueValues = new Set(['1', 'true', 'yes', 'on']);

function parseFlag(value: string | undefined, fallback: boolean) {
  if (value == null) {
    return fallback;
  }

  return trueValues.has(value.toLowerCase());
}

const defaultDemoWalletEnabled = process.env.NODE_ENV !== 'production';
const demoWalletConfigured = Boolean(env.MNEMONIC);

export const runtimeFlags = {
  demoWalletClientEnabled: parseFlag(env.NEXT_PUBLIC_ENABLE_DEMO_WALLET, defaultDemoWalletEnabled) && demoWalletConfigured,
  demoWalletServerEnabled: parseFlag(
    env.ENABLE_DEMO_WALLET ?? env.NEXT_PUBLIC_ENABLE_DEMO_WALLET,
    defaultDemoWalletEnabled,
  ) && demoWalletConfigured,
};
