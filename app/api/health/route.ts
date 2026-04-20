import { ok } from '@/lib/api';
import { env, runtimeFlags } from '@/lib/env';
import { TELEGRAM_WEBHOOK_PATH } from '@/lib/telegram/bot';

export function GET() {
  return ok({
    name: 'tonroute',
    network: env.NETWORK,
    status: 'ok',
    timestamp: new Date().toISOString(),
    cloudflareReady: true,
    demoWalletEnabled: runtimeFlags.demoWalletServerEnabled,
    telegram: {
      webhookPath: TELEGRAM_WEBHOOK_PATH,
      configured: Boolean(env.TELEGRAM_BOT_TOKEN),
      secretProtected: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
    },
  });
}
