import 'dotenv/config';
import { createTelegramBot } from '@/lib/telegram/bot';

const bot = createTelegramBot();

async function main() {
  await bot.telegram.setMyCommands([
    { command: 'start', description: 'Open TonRoute' },
    { command: 'help', description: 'Show TonRoute bot help' },
    { command: 'route', description: 'Analyze a TON wallet and recommend a route' },
  ]);

  await bot.launch();
  console.log('TonRoute bot started with long polling.');
}

main().catch((error) => {
  console.error('Failed to start TonRoute bot:', error);
  process.exitCode = 1;
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
