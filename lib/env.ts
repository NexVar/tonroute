import { z } from 'zod';

const envSchema = z.object({
  NETWORK: z.enum(['mainnet', 'testnet']).default('testnet'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  TONCENTER_API_KEY: z.string().min(1),
  TONAPI_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  WALLET_VERSION: z.string().min(1).optional(),
  TON_WALLET_ADDRESS: z.string().min(1).optional(),
  MNEMONIC: z.string().min(1).optional(),
  PRIVATE_KEY: z.string().min(1).optional(),
  TON_WALLET_PUBLIC_KEY: z.string().min(1).optional()
});

export const env = envSchema.parse({
  NETWORK: process.env.NETWORK,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  TONCENTER_API_KEY: process.env.TONCENTER_API_KEY,
  TONAPI_KEY: process.env.TONAPI_KEY,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  WALLET_VERSION: process.env.WALLET_VERSION,
  TON_WALLET_ADDRESS: process.env.TON_WALLET_ADDRESS,
  MNEMONIC: process.env.MNEMONIC,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  TON_WALLET_PUBLIC_KEY: process.env.TON_WALLET_PUBLIC_KEY
});
