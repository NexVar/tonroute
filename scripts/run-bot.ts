import 'dotenv/config';
import { createTelegramBot, telegramBotCommands } from '@/lib/telegram/bot';

const bot = createTelegramBot();

async function main() {
  await bot.telegram.deleteWebhook({ drop_pending_updates: false });
  await bot.telegram.setMyCommands([...telegramBotCommands]);
  await bot.launch();
  console.log('TonRoute bot started with long polling.');
}

main().catch((error) => {
  console.error('Failed to start TonRoute bot:', error);
  process.exitCode = 1;
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
