import type { Update } from 'telegraf/types';
import { fail, ok } from '@/lib/api';
import { env } from '@/lib/env';
import { handleTelegramUpdate } from '@/lib/telegram/bot';

export const dynamic = 'force-dynamic';

const payloadKeys = [
  'message',
  'edited_message',
  'channel_post',
  'edited_channel_post',
  'inline_query',
  'chosen_inline_result',
  'callback_query',
  'shipping_query',
  'pre_checkout_query',
  'poll',
  'poll_answer',
  'my_chat_member',
  'chat_member',
  'chat_join_request',
  'message_reaction',
  'message_reaction_count',
  'business_connection',
  'business_message',
  'edited_business_message',
  'deleted_business_messages',
  'purchased_paid_media',
] as const;

function isAuthorized(request: Request) {
  if (!env.TELEGRAM_WEBHOOK_SECRET) {
    return true;
  }

  return request.headers.get('x-telegram-bot-api-secret-token') === env.TELEGRAM_WEBHOOK_SECRET;
}

export async function POST(request: Request) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    return fail('Telegram bot is not configured.', 'Missing TELEGRAM_BOT_TOKEN.', 503);
  }

  if (!isAuthorized(request)) {
    return fail('Unauthorized webhook request.', 'Missing or invalid Telegram webhook secret.', 401);
  }

  try {
    const update = (await request.json()) as Partial<Update> & { update_id?: number };

    if (typeof update?.update_id !== 'number') {
      return fail('Malformed Telegram webhook update.', 'Expected a Telegram update with numeric update_id.', 400);
    }

    const hasPayload = payloadKeys.some((key) => key in update);
    if (!hasPayload) {
      return ok({ received: true, ignored: true });
    }

    await handleTelegramUpdate(update as Update);
    return ok({ received: true });
  } catch (error) {
    return fail('Unable to process Telegram webhook update.', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

export function GET() {
  return ok({
    status: 'ok',
    configured: Boolean(env.TELEGRAM_BOT_TOKEN),
    secretProtected: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
  });
}
