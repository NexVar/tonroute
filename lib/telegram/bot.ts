import { Telegraf, type Context } from 'telegraf';
import type { Update } from 'telegraf/types';
import { env } from '@/lib/env';
import { analyzePortfolio } from '@/lib/ton/api';
import { recommendStrategy } from '@/lib/strategy/engine';

export const TELEGRAM_WEBHOOK_PATH = '/api/telegram/webhook';

export const telegramBotCommands = [
  { command: 'start', description: 'Open TonRoute' },
  { command: 'help', description: 'Show TonRoute bot help' },
  { command: 'route', description: 'Analyze a TON wallet and recommend a route' },
] as const;

function buildAppUrl(path = '') {
  return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}${path}`;
}

export function buildTelegramWebhookUrl() {
  return buildAppUrl(TELEGRAM_WEBHOOK_PATH);
}

function buildHelpText() {
  return ['Commands:', '/start - Open TonRoute', '/help - Show this help', '/route <wallet> - Analyze a TON wallet and get a recommendation'].join('\n');
}

async function buildRouteReply(address: string) {
  const analysis = await analyzePortfolio(address);
  const goals = ['safe', 'balanced', 'yield'] as const;
  const recommendations = goals.map((goal) => recommendStrategy(goal, analysis));
  const best = recommendations.reduce((current, candidate) =>
    candidate.expectedApy > current.expectedApy ? candidate : current,
  );

  return [
    `Wallet: ${analysis.address}`,
    `Idle TON: ${analysis.idleTon}`,
    `Best fit: ${best.label}`,
    `Estimated portfolio APY: ${best.expectedApy}%`,
    `Why: ${best.why[0]}`,
    `Web app: ${buildAppUrl('/')}`,
  ].join('\n');
}

async function sendTelegramApi(method: string, body: Record<string, unknown>) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
  }

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as { ok: boolean; description?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description ?? `Telegram API ${method} failed (${response.status})`);
  }
}

async function sendTelegramText(chatId: number, text: string, replyMarkup?: Record<string, unknown>) {
  await sendTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

function registerTelegramHandlers(bot: Telegraf<Context>) {
  bot.start(async (ctx) => {
    await ctx.reply(
      'Welcome to TonRoute. I can inspect a TON testnet wallet and suggest Safe / Balanced / Yield routing, then send you into the web app.',
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Open TonRoute', web_app: { url: buildAppUrl('/') } }]],
        },
      },
    );
  });

  bot.help(async (ctx) => {
    await ctx.reply(buildHelpText());
  });

  bot.command('route', async (ctx) => {
    const text = 'text' in ctx.message ? ctx.message.text : '';
    const address = text.split(/\s+/).slice(1).join(' ').trim();

    if (!address) {
      await ctx.reply('Usage: /route <ton-wallet-address>');
      return;
    }

    try {
      await ctx.reply(await buildRouteReply(address));
    } catch (error) {
      await ctx.reply(
        `TonRoute could not analyze that wallet: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  });
}

let botSingleton: Telegraf<Context> | null = null;

export function createTelegramBot() {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
  }

  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
  registerTelegramHandlers(bot);
  bot.catch((error) => {
    console.error('Telegram bot handler failed:', error);
    throw error;
  });
  return bot;
}

export function getTelegramBot() {
  botSingleton ??= createTelegramBot();
  return botSingleton;
}

export async function handleTelegramUpdate(update: Update) {
  const message = 'message' in update ? update.message : undefined;
  const text = message && 'text' in message ? message.text : undefined;
  const chatId = message?.chat?.id;

  if (!message || typeof text !== 'string' || typeof chatId !== 'number') {
    return;
  }

  const [command, ...rest] = text.trim().split(/\s+/);
  const normalizedCommand = command?.split('@')[0]?.toLowerCase();

  switch (normalizedCommand) {
    case '/start':
      await sendTelegramText(
        chatId,
        'Welcome to TonRoute. I can inspect a TON testnet wallet and suggest Safe / Balanced / Yield routing, then send you into the web app.',
        {
          inline_keyboard: [[{ text: 'Open TonRoute', web_app: { url: buildAppUrl('/') } }]],
        },
      );
      return;
    case '/help':
      await sendTelegramText(chatId, buildHelpText());
      return;
    case '/route': {
      const address = rest.join(' ').trim();
      if (!address) {
        await sendTelegramText(chatId, 'Usage: /route <ton-wallet-address>');
        return;
      }
      try {
        await sendTelegramText(chatId, await buildRouteReply(address));
      } catch (error) {
        await sendTelegramText(
          chatId,
          `TonRoute could not analyze that wallet: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
      return;
    }
    default:
      return;
  }
}
