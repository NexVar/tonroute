import { Telegraf } from 'telegraf';
import { env } from '@/lib/env';
import { analyzePortfolio } from '@/lib/ton/api';
import { recommendStrategy } from '@/lib/strategy/engine';

function buildAppUrl(path = '') {
  return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}${path}`;
}

export function createTelegramBot() {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
  }

  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

  bot.start(async (ctx) => {
    await ctx.reply(
      'Welcome to TonRoute. I can inspect a TON testnet wallet and suggest Safe / Balanced / Yield routing, then send you into the web app.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Open TonRoute', web_app: { url: buildAppUrl('/') } }],
          ],
        },
      },
    );
  });

  bot.help(async (ctx) => {
    await ctx.reply([
      'Commands:',
      '/start - Open TonRoute',
      '/help - Show this help',
      '/route <wallet> - Analyze a TON wallet and get a recommendation',
    ].join('\n'));
  });

  bot.command('route', async (ctx) => {
    const text = 'text' in ctx.message ? ctx.message.text : '';
    const address = text.split(/\s+/).slice(1).join(' ').trim();

    if (!address) {
      await ctx.reply('Usage: /route <ton-wallet-address>');
      return;
    }

    try {
      const analysis = await analyzePortfolio(address);
      const goals = ['safe', 'balanced', 'yield'] as const;
      const recommendations = goals.map((goal) => recommendStrategy(goal, analysis));
      const best = recommendations.reduce((current, candidate) =>
        candidate.expectedApy > current.expectedApy ? candidate : current,
      );

      await ctx.reply([
        `Wallet: ${analysis.address}`,
        `Idle TON: ${analysis.idleTon}`,
        `Best fit: ${best.label}`,
        `Estimated portfolio APY: ${best.expectedApy}%`,
        `Why: ${best.why[0]}`,
        `Web app: ${buildAppUrl('/')}`,
      ].join('\n'));
    } catch (error) {
      await ctx.reply(`TonRoute could not analyze that wallet: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  });

  return bot;
}
