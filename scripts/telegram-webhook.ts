import 'dotenv/config';
import { env } from '@/lib/env';
import { buildTelegramWebhookUrl, telegramBotCommands } from '@/lib/telegram/bot';

const action = process.argv[2] ?? 'info';
const TELEGRAM_API_BASE = env.TELEGRAM_BOT_TOKEN
  ? `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`
  : null;

async function telegramApi<T>(method: string, body?: Record<string, unknown>) {
  if (!TELEGRAM_API_BASE) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/${method}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json()) as { ok: boolean; result?: T; description?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description ?? `Telegram API ${method} failed (${response.status})`);
  }

  return payload.result as T;
}

async function registerWebhook() {
  const url = buildTelegramWebhookUrl();

  await telegramApi('setMyCommands', { commands: telegramBotCommands });
  const result = await telegramApi<boolean>('setWebhook', {
    url,
    secret_token: env.TELEGRAM_WEBHOOK_SECRET,
    drop_pending_updates: false,
  });

  console.log(
    JSON.stringify(
      {
        ok: result,
        webhook: url,
        secretProtected: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
      },
      null,
      2,
    ),
  );
}

async function getWebhookInfo() {
  const [me, webhook] = await Promise.all([
    telegramApi<{ username?: string; id: number }>('getMe'),
    telegramApi<Record<string, unknown>>('getWebhookInfo'),
  ]);

  console.log(JSON.stringify({ bot: me, webhook }, null, 2));
}

async function deleteWebhook() {
  const result = await telegramApi<boolean>('deleteWebhook', {
    drop_pending_updates: false,
  });
  console.log(JSON.stringify({ ok: result }, null, 2));
}

async function main() {
  switch (action) {
    case 'set':
    case 'register':
      await registerWebhook();
      return;
    case 'delete':
      await deleteWebhook();
      return;
    case 'info':
      await getWebhookInfo();
      return;
    default:
      throw new Error(`Unknown action: ${action}. Use one of: register, info, delete.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
